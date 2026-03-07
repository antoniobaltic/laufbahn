"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  buildDocumentPreview,
  markdownToPlainText,
  normalizeDocumentTags,
  normalizeMarkdown,
} from "@/lib/utils/documents";
import type { ActivityMetadata, ActivityType } from "@/types/activity";
import type {
  ApplicationSourceDocument,
  CreateSourceDocumentInput,
  DocumentPickerOption,
  LinkSourceDocumentToApplicationInput,
  LinkedApplicationSummary,
  SourceDocument,
  SourceDocumentEditorMode,
  SourceDocumentOverviewItem,
  SourceDocumentSourceKind,
  SourceDocumentType,
  SourceDocumentVersion,
  SourceDocumentWorkspace,
  UpdateSourceDocumentInput,
} from "@/types/document";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

async function getAuthenticatedClient() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Nicht angemeldet");
  }

  return { supabase, user };
}

function revalidateDocumentPaths({
  documentIds = [],
  applicationIds = [],
}: {
  documentIds?: string[];
  applicationIds?: string[];
} = {}) {
  revalidatePath("/dokumente");
  revalidatePath("/bewerbung");
  revalidatePath("/analytics");

  new Set(documentIds).forEach((documentId) => {
    revalidatePath(`/dokumente/${documentId}`);
  });

  new Set(applicationIds).forEach((applicationId) => {
    revalidatePath(`/bewerbung/${applicationId}`);
  });
}

function normalizeOptionalString(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function normalizeEditorMode(
  value?: SourceDocumentEditorMode | null
): SourceDocumentEditorMode {
  return value === "markdown" ? "markdown" : "guided";
}

function normalizeSourceKind(
  value?: SourceDocumentSourceKind | null
): SourceDocumentSourceKind {
  switch (value) {
    case "import_docx":
    case "import_pdf":
    case "restore":
    case "variant":
      return value;
    default:
      return "manual";
  }
}

function normalizeCreatePayload(input: CreateSourceDocumentInput) {
  return {
    title: input.title.trim(),
    document_type: input.document_type,
    tags: normalizeDocumentTags(input.tags),
    parent_document_id: input.parent_document_id?.trim() || null,
    markdown_content: normalizeMarkdown(input.markdown_content),
    version_label: normalizeOptionalString(input.version_label),
    change_note: normalizeOptionalString(input.change_note),
    editor_mode: normalizeEditorMode(input.editor_mode),
    source_kind: normalizeSourceKind(input.source_kind),
    source_version_id: input.source_version_id?.trim() || null,
  };
}

function normalizeUpdatePayload(input: UpdateSourceDocumentInput) {
  return {
    title: normalizeOptionalString(input.title),
    tags: normalizeDocumentTags(input.tags),
    markdown_content: normalizeMarkdown(input.markdown_content),
    version_label: normalizeOptionalString(input.version_label),
    change_note: normalizeOptionalString(input.change_note),
    editor_mode: normalizeEditorMode(input.editor_mode),
  };
}

async function insertActivity(
  supabase: SupabaseServerClient,
  {
    userId,
    applicationId,
    activityType,
    title,
    metadata,
  }: {
    userId: string;
    applicationId: string;
    activityType: ActivityType;
    title: string;
    metadata?: ActivityMetadata;
  }
) {
  const { error } = await supabase.from("activities").insert({
    user_id: userId,
    application_id: applicationId,
    activity_type: activityType,
    title,
    metadata: metadata ?? {},
  });

  if (error) {
    console.error("Error inserting activity from document action:", error);
    throw new Error("Aktivität konnte nicht gespeichert werden.");
  }
}

async function getOwnedDocument(
  supabase: SupabaseServerClient,
  userId: string,
  documentId: string
) {
  const { data, error } = await supabase
    .from("source_documents")
    .select("*")
    .eq("id", documentId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching owned document:", error);
    throw new Error("Dokument konnte nicht geladen werden.");
  }

  if (!data) {
    throw new Error("Dokument nicht gefunden.");
  }

  return data as SourceDocument;
}

async function getOwnedVersion(
  supabase: SupabaseServerClient,
  userId: string,
  versionId: string
) {
  const { data, error } = await supabase
    .from("source_document_versions")
    .select("*")
    .eq("id", versionId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching owned document version:", error);
    throw new Error("Version konnte nicht geladen werden.");
  }

  if (!data) {
    throw new Error("Version nicht gefunden.");
  }

  return data as SourceDocumentVersion;
}

async function getCurrentVersionsForDocuments(
  supabase: SupabaseServerClient,
  currentVersionIds: string[]
) {
  if (!currentVersionIds.length) {
    return new Map<string, SourceDocumentVersion>();
  }

  const { data, error } = await supabase
    .from("source_document_versions")
    .select("*")
    .in("id", [...new Set(currentVersionIds)]);

  if (error) {
    console.error("Error fetching current document versions:", error);
    throw new Error("Versionen konnten nicht geladen werden.");
  }

  return new Map(
    ((data ?? []) as SourceDocumentVersion[]).map((version) => [version.id, version])
  );
}

async function getUsageRowsForDocuments(
  supabase: SupabaseServerClient,
  userId: string,
  documentIds: string[]
) {
  if (!documentIds.length) {
    return [];
  }

  const { data, error } = await supabase
    .from("application_source_documents")
    .select(
      `
        id,
        user_id,
        application_id,
        source_document_id,
        source_document_version_id,
        document_type,
        title_snapshot,
        version_number_snapshot,
        version_label_snapshot,
        markdown_snapshot,
        linked_at,
        updated_at,
        application:applications (
          id,
          company_name,
          role_title,
          status
        )
      `
    )
    .eq("user_id", userId)
    .in("source_document_id", documentIds)
    .order("linked_at", { ascending: false });

  if (error) {
    console.error("Error fetching document usages:", error);
    throw new Error("Dokumentverwendungen konnten nicht geladen werden.");
  }

  return normalizeUsageRows(data ?? []);
}

function normalizeUsageRows(rows: unknown[]) {
  return rows.map((row) => {
    const item = row as ApplicationSourceDocument & {
      application?: LinkedApplicationSummary[] | LinkedApplicationSummary | null;
    };
    const application = Array.isArray(item.application)
      ? item.application[0] ?? null
      : item.application ?? null;

    return {
      ...item,
      application,
    } satisfies ApplicationSourceDocument;
  });
}

function buildOverviewItems(
  documents: SourceDocument[],
  currentVersions: Map<string, SourceDocumentVersion>,
  usages: ApplicationSourceDocument[]
) {
  const parentTitleMap = new Map(
    documents.map((document) => [document.id, document.title])
  );
  const childCountMap = documents.reduce((map, document) => {
    if (document.parent_document_id) {
      map.set(
        document.parent_document_id,
        (map.get(document.parent_document_id) ?? 0) + 1
      );
    }

    return map;
  }, new Map<string, number>());
  const usageMap = usages.reduce((map, usage) => {
    const list = map.get(usage.source_document_id) ?? [];
    list.push(usage);
    map.set(usage.source_document_id, list);
    return map;
  }, new Map<string, ApplicationSourceDocument[]>());

  return documents.map((document) => {
    const currentVersion = document.current_version_id
      ? currentVersions.get(document.current_version_id) ?? null
      : null;
    const usageRows = usageMap.get(document.id) ?? [];

    return {
      document,
      currentVersion,
      usageCount: usageRows.length,
      recentApplications: usageRows
        .map((usage) => usage.application)
        .filter((application): application is LinkedApplicationSummary =>
          Boolean(application)
        )
        .slice(0, 3),
      childCount: childCountMap.get(document.id) ?? 0,
      parentTitle: document.parent_document_id
        ? parentTitleMap.get(document.parent_document_id) ?? null
        : null,
    } satisfies SourceDocumentOverviewItem;
  });
}

async function assertParentDocument(
  supabase: SupabaseServerClient,
  userId: string,
  parentDocumentId: string,
  documentType: SourceDocumentType
) {
  const parent = await getOwnedDocument(supabase, userId, parentDocumentId);

  if (parent.document_type !== documentType) {
    throw new Error("Die Variante muss denselben Dokumenttyp behalten.");
  }

  return parent;
}

async function assertSourceVersion(
  supabase: SupabaseServerClient,
  userId: string,
  sourceVersionId: string,
  expectedDocumentId?: string | null
) {
  const version = await getOwnedVersion(supabase, userId, sourceVersionId);

  if (expectedDocumentId && version.document_id !== expectedDocumentId) {
    throw new Error("Die gewählte Version passt nicht zum Dokument.");
  }

  return version;
}

async function createVersionRow(
  supabase: SupabaseServerClient,
  {
    userId,
    documentId,
    versionNumber,
    markdownContent,
    versionLabel,
    changeNote,
    editorMode,
    sourceKind,
    sourceVersionId,
  }: {
    userId: string;
    documentId: string;
    versionNumber: number;
    markdownContent: string;
    versionLabel: string | null;
    changeNote: string | null;
    editorMode: SourceDocumentEditorMode;
    sourceKind: SourceDocumentSourceKind;
    sourceVersionId: string | null;
  }
) {
  const { data, error } = await supabase
    .from("source_document_versions")
    .insert({
      user_id: userId,
      document_id: documentId,
      source_version_id: sourceVersionId,
      version_number: versionNumber,
      version_label: versionLabel,
      markdown_content: markdownContent,
      plain_text: markdownToPlainText(markdownContent),
      editor_mode: editorMode,
      change_note: changeNote,
      source_kind: sourceKind,
    })
    .select("*")
    .single();

  if (error) {
    console.error("Error creating source document version:", error);
    throw new Error("Version konnte nicht gespeichert werden.");
  }

  return data as SourceDocumentVersion;
}

export async function getDocumentsOverview() {
  const { supabase, user } = await getAuthenticatedClient();
  const { data, error } = await supabase
    .from("source_documents")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_archived", false)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Error fetching source documents:", error);
    return [] as SourceDocumentOverviewItem[];
  }

  const documents = (data ?? []) as SourceDocument[];
  const currentVersions = await getCurrentVersionsForDocuments(
    supabase,
    documents
      .map((document) => document.current_version_id)
      .filter((value): value is string => Boolean(value))
  );
  const usages = await getUsageRowsForDocuments(
    supabase,
    user.id,
    documents.map((document) => document.id)
  );

  return buildOverviewItems(documents, currentVersions, usages);
}

export async function getDocumentPickerOptions(documentType?: SourceDocumentType) {
  const { supabase, user } = await getAuthenticatedClient();
  let query = supabase
    .from("source_documents")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_archived", false)
    .not("current_version_id", "is", null)
    .order("updated_at", { ascending: false });

  if (documentType) {
    query = query.eq("document_type", documentType);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching document picker options:", error);
    return [] as DocumentPickerOption[];
  }

  const documents = (data ?? []) as SourceDocument[];
  const currentVersions = await getCurrentVersionsForDocuments(
    supabase,
    documents
      .map((document) => document.current_version_id)
      .filter((value): value is string => Boolean(value))
  );
  const usages = await getUsageRowsForDocuments(
    supabase,
    user.id,
    documents.map((document) => document.id)
  );
  const usageCountMap = usages.reduce((map, usage) => {
    map.set(usage.source_document_id, (map.get(usage.source_document_id) ?? 0) + 1);
    return map;
  }, new Map<string, number>());

  return documents
    .map((document) => {
      const currentVersion = document.current_version_id
        ? currentVersions.get(document.current_version_id)
        : null;

      if (!currentVersion) {
        return null;
      }

      return {
        documentId: document.id,
        title: document.title,
        documentType: document.document_type,
        tags: document.tags,
        currentVersionId: currentVersion.id,
        currentVersionNumber: currentVersion.version_number,
        currentVersionLabel: currentVersion.version_label,
        preview: buildDocumentPreview(currentVersion.markdown_content),
        usageCount: usageCountMap.get(document.id) ?? 0,
      } satisfies DocumentPickerOption;
    })
    .filter((item): item is DocumentPickerOption => Boolean(item));
}

export async function getApplicationSourceDocuments(applicationId: string) {
  const { supabase, user } = await getAuthenticatedClient();
  const { data, error } = await supabase
    .from("application_source_documents")
    .select(
      `
        id,
        user_id,
        application_id,
        source_document_id,
        source_document_version_id,
        document_type,
        title_snapshot,
        version_number_snapshot,
        version_label_snapshot,
        markdown_snapshot,
        linked_at,
        updated_at,
        application:applications (
          id,
          company_name,
          role_title,
          status
        )
      `
    )
    .eq("application_id", applicationId)
    .eq("user_id", user.id)
    .order("linked_at", { ascending: false });

  if (error) {
    console.error("Error fetching application source documents:", error);
    return [] as ApplicationSourceDocument[];
  }

  return normalizeUsageRows(data ?? []);
}

export async function getDocumentWorkspace(documentId: string) {
  const { supabase, user } = await getAuthenticatedClient();
  const document = await getOwnedDocument(supabase, user.id, documentId);
  const [versionsResult, usageRows, childDocumentsResult] = await Promise.all([
    supabase
      .from("source_document_versions")
      .select("*")
      .eq("document_id", documentId)
      .eq("user_id", user.id)
      .order("version_number", { ascending: false }),
    getUsageRowsForDocuments(supabase, user.id, [documentId]),
    supabase
      .from("source_documents")
      .select("*")
      .eq("parent_document_id", documentId)
      .eq("user_id", user.id)
      .eq("is_archived", false)
      .order("updated_at", { ascending: false }),
  ]);

  if (versionsResult.error) {
    console.error("Error fetching source document versions:", versionsResult.error);
    throw new Error("Versionen konnten nicht geladen werden.");
  }

  if (childDocumentsResult.error) {
    console.error("Error fetching child source documents:", childDocumentsResult.error);
    throw new Error("Varianten konnten nicht geladen werden.");
  }

  const versions = (versionsResult.data ?? []) as SourceDocumentVersion[];
  const currentVersion =
    versions.find((version) => version.id === document.current_version_id) ??
    versions[0] ??
    null;
  const childDocuments = (childDocumentsResult.data ?? []) as SourceDocument[];
  const childCurrentVersions = await getCurrentVersionsForDocuments(
    supabase,
    childDocuments
      .map((child) => child.current_version_id)
      .filter((value): value is string => Boolean(value))
  );
  const childUsages = await getUsageRowsForDocuments(
    supabase,
    user.id,
    childDocuments.map((child) => child.id)
  );
  const childOverviewItems = buildOverviewItems(
    childDocuments,
    childCurrentVersions,
    childUsages
  );

  const lineage: Pick<SourceDocument, "id" | "title" | "document_type">[] = [];
  let currentParentId = document.parent_document_id;
  const seenParentIds = new Set<string>();

  while (currentParentId && !seenParentIds.has(currentParentId)) {
    seenParentIds.add(currentParentId);
    const parent = await getOwnedDocument(supabase, user.id, currentParentId);
    lineage.unshift({
      id: parent.id,
      title: parent.title,
      document_type: parent.document_type,
    });
    currentParentId = parent.parent_document_id;
  }

  return {
    document,
    currentVersion,
    versions,
    usages: usageRows,
    childDocuments: childOverviewItems,
    lineage,
  } satisfies SourceDocumentWorkspace;
}

export async function createSourceDocument(input: CreateSourceDocumentInput) {
  const { supabase, user } = await getAuthenticatedClient();
  const payload = normalizeCreatePayload(input);

  if (!payload.title) {
    throw new Error("Bitte gib einen Titel ein.");
  }

  if (!payload.markdown_content) {
    throw new Error("Bitte füge Inhalt hinzu.");
  }

  if (payload.parent_document_id) {
    await assertParentDocument(
      supabase,
      user.id,
      payload.parent_document_id,
      payload.document_type
    );
  }

  if (payload.source_version_id) {
    const expectedDocumentId = payload.parent_document_id || undefined;
    await assertSourceVersion(
      supabase,
      user.id,
      payload.source_version_id,
      expectedDocumentId
    );
  }

  const { data: documentRow, error: documentError } = await supabase
    .from("source_documents")
    .insert({
      user_id: user.id,
      parent_document_id: payload.parent_document_id,
      title: payload.title,
      document_type: payload.document_type,
      tags: payload.tags,
    })
    .select("*")
    .single();

  if (documentError) {
    console.error("Error creating source document:", documentError);
    throw new Error("Dokument konnte nicht erstellt werden.");
  }

  const document = documentRow as SourceDocument;
  const version = await createVersionRow(supabase, {
    userId: user.id,
    documentId: document.id,
    versionNumber: 1,
    markdownContent: payload.markdown_content,
    versionLabel: payload.version_label,
    changeNote: payload.change_note,
    editorMode: payload.editor_mode,
    sourceKind: payload.source_kind,
    sourceVersionId: payload.source_version_id,
  });

  const { error: updateError } = await supabase
    .from("source_documents")
    .update({
      current_version_id: version.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", document.id)
    .eq("user_id", user.id);

  if (updateError) {
    console.error("Error linking current version to source document:", updateError);
    throw new Error("Dokument konnte nicht abgeschlossen werden.");
  }

  revalidateDocumentPaths({ documentIds: [document.id] });

  return {
    document: {
      ...document,
      current_version_id: version.id,
      updated_at: new Date().toISOString(),
    } satisfies SourceDocument,
    version,
  };
}

export async function saveSourceDocumentVersion(
  documentId: string,
  input: UpdateSourceDocumentInput
) {
  const { supabase, user } = await getAuthenticatedClient();
  const document = await getOwnedDocument(supabase, user.id, documentId);
  const payload = normalizeUpdatePayload(input);

  if (!payload.markdown_content) {
    throw new Error("Bitte füge Inhalt hinzu.");
  }

  const currentVersion = document.current_version_id
    ? await getOwnedVersion(supabase, user.id, document.current_version_id)
    : null;
  const normalizedTitle = payload.title || document.title;
  const titleChanged = normalizedTitle !== document.title;
  const tagsChanged =
    JSON.stringify(payload.tags) !== JSON.stringify(document.tags ?? []);
  const contentChanged =
    payload.markdown_content !== (currentVersion?.markdown_content ?? "");
  const editorModeChanged =
    payload.editor_mode !== (currentVersion?.editor_mode ?? "guided");
  const shouldCreateVersion =
    contentChanged || Boolean(payload.version_label) || Boolean(payload.change_note);
  const nextUpdatedAt = new Date().toISOString();

  if (!shouldCreateVersion) {
    let nextVersion = currentVersion;

    if (currentVersion && editorModeChanged) {
      const { data: updatedVersion, error: versionError } = await supabase
        .from("source_document_versions")
        .update({
          editor_mode: payload.editor_mode,
        })
        .eq("id", currentVersion.id)
        .eq("user_id", user.id)
        .select("*")
        .single();

      if (versionError) {
        console.error("Error updating source document editor mode:", versionError);
        throw new Error("Ansicht konnte nicht gespeichert werden.");
      }

      nextVersion = updatedVersion as SourceDocumentVersion;
    }

    if (titleChanged || tagsChanged || editorModeChanged) {
      const { error } = await supabase
        .from("source_documents")
        .update({
          title: normalizedTitle,
          tags: payload.tags,
          updated_at: nextUpdatedAt,
        })
        .eq("id", documentId)
        .eq("user_id", user.id);

      if (error) {
        console.error("Error updating source document metadata:", error);
        throw new Error("Dokument konnte nicht aktualisiert werden.");
      }

      revalidateDocumentPaths({ documentIds: [documentId] });
    }

    return {
      document: {
        ...document,
        title: normalizedTitle,
        tags: payload.tags,
        updated_at: titleChanged || tagsChanged || editorModeChanged
          ? nextUpdatedAt
          : document.updated_at,
      } satisfies SourceDocument,
      version: nextVersion,
      createdNewVersion: false,
    };
  }

  const nextVersionNumber = (currentVersion?.version_number ?? 0) + 1;
  const version = await createVersionRow(supabase, {
    userId: user.id,
    documentId,
    versionNumber: nextVersionNumber,
    markdownContent: payload.markdown_content,
    versionLabel: payload.version_label,
    changeNote: payload.change_note,
    editorMode: payload.editor_mode,
    sourceKind: "manual",
    sourceVersionId: currentVersion?.id ?? null,
  });

  const { error } = await supabase
    .from("source_documents")
    .update({
      title: normalizedTitle,
      tags: payload.tags,
      current_version_id: version.id,
      updated_at: nextUpdatedAt,
    })
    .eq("id", documentId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error updating source document after version save:", error);
    throw new Error("Neue Version konnte nicht gespeichert werden.");
  }

  revalidateDocumentPaths({ documentIds: [documentId] });

  return {
    document: {
      ...document,
      title: normalizedTitle,
      tags: payload.tags,
      current_version_id: version.id,
      updated_at: nextUpdatedAt,
    } satisfies SourceDocument,
    version,
    createdNewVersion: true,
  };
}

export async function restoreSourceDocumentVersion(
  documentId: string,
  versionId: string
) {
  const { supabase, user } = await getAuthenticatedClient();
  const document = await getOwnedDocument(supabase, user.id, documentId);
  const targetVersion = await assertSourceVersion(
    supabase,
    user.id,
    versionId,
    documentId
  );
  const currentVersion = document.current_version_id
    ? await getOwnedVersion(supabase, user.id, document.current_version_id)
    : null;
  const nextVersionNumber = (currentVersion?.version_number ?? 0) + 1;
  const restoredVersion = await createVersionRow(supabase, {
    userId: user.id,
    documentId,
    versionNumber: nextVersionNumber,
    markdownContent: targetVersion.markdown_content,
    versionLabel: targetVersion.version_label,
    changeNote: `Wiederhergestellt aus Version ${targetVersion.version_number}`,
    editorMode: targetVersion.editor_mode,
    sourceKind: "restore",
    sourceVersionId: targetVersion.id,
  });

  const { error } = await supabase
    .from("source_documents")
    .update({
      current_version_id: restoredVersion.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", documentId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error restoring source document version:", error);
    throw new Error("Version konnte nicht wiederhergestellt werden.");
  }

  revalidateDocumentPaths({ documentIds: [documentId] });
  return restoredVersion;
}

export async function linkSourceDocumentToApplication(
  input: LinkSourceDocumentToApplicationInput
) {
  const { supabase, user } = await getAuthenticatedClient();
  const document = await getOwnedDocument(supabase, user.id, input.source_document_id);
  const version = await assertSourceVersion(
    supabase,
    user.id,
    input.source_document_version_id,
    input.source_document_id
  );
  const { data: application, error: applicationError } = await supabase
    .from("applications")
    .select("id, company_name, role_title")
    .eq("id", input.application_id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (applicationError) {
    console.error("Error fetching application for document link:", applicationError);
    throw new Error("Bewerbung konnte nicht geladen werden.");
  }

  if (!application) {
    throw new Error("Bewerbung nicht gefunden.");
  }

  const { data: existingRow } = await supabase
    .from("application_source_documents")
    .select("id")
    .eq("application_id", input.application_id)
    .eq("user_id", user.id)
    .eq("document_type", document.document_type)
    .maybeSingle();

  const { data, error } = await supabase
    .from("application_source_documents")
    .upsert(
      {
        user_id: user.id,
        application_id: input.application_id,
        source_document_id: document.id,
        source_document_version_id: version.id,
        document_type: document.document_type,
        title_snapshot: document.title,
        version_number_snapshot: version.version_number,
        version_label_snapshot: version.version_label,
        markdown_snapshot: version.markdown_content,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "application_id,document_type",
      }
    )
    .select("*")
    .single();

  if (error) {
    console.error("Error linking source document to application:", error);
    throw new Error("Dokument konnte nicht mit der Bewerbung verknüpft werden.");
  }

  await insertActivity(supabase, {
    userId: user.id,
    applicationId: input.application_id,
    activityType: existingRow ? "document_updated" : "document_uploaded",
    title: `${
      document.document_type === "lebenslauf" ? "Lebenslauf" : "Anschreiben"
    } verknüpft: ${document.title}`,
    metadata: {
      document_title: document.title,
      document_type: document.document_type,
      version_label:
        version.version_label || `Version ${version.version_number}`,
    },
  });

  revalidateDocumentPaths({
    documentIds: [document.id],
    applicationIds: [input.application_id],
  });

  return data as ApplicationSourceDocument;
}

export async function unlinkSourceDocumentFromApplication(
  applicationId: string,
  documentType: SourceDocumentType
) {
  const { supabase, user } = await getAuthenticatedClient();
  const { data: existing, error: existingError } = await supabase
    .from("application_source_documents")
    .select(
      "id, source_document_id, title_snapshot, version_number_snapshot, version_label_snapshot, document_type"
    )
    .eq("application_id", applicationId)
    .eq("user_id", user.id)
    .eq("document_type", documentType)
    .maybeSingle();

  if (existingError) {
    console.error("Error fetching source document link for removal:", existingError);
    throw new Error("Dokumentverknüpfung konnte nicht geladen werden.");
  }

  if (!existing) {
    return null;
  }

  const { error } = await supabase
    .from("application_source_documents")
    .delete()
    .eq("id", existing.id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error unlinking source document from application:", error);
    throw new Error("Dokumentverknüpfung konnte nicht entfernt werden.");
  }

  await insertActivity(supabase, {
    userId: user.id,
    applicationId,
    activityType: "document_updated",
    title: `${
      documentType === "lebenslauf" ? "Lebenslauf" : "Anschreiben"
    } entfernt: ${existing.title_snapshot}`,
    metadata: {
      document_title: existing.title_snapshot,
      document_type: existing.document_type,
      document_action: "removed",
      version_label:
        existing.version_label_snapshot ||
        `Version ${existing.version_number_snapshot}`,
    },
  });

  revalidateDocumentPaths({
    documentIds: [existing.source_document_id],
    applicationIds: [applicationId],
  });

  return existing;
}
