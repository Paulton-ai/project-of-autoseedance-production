export type WorkerCaption = { start: number; end: number; text: string };
export type WorkerJob = {
  id: string;
  status: "validating" | "uploaded" | "transcribing" | "transcribed" | "rendering" | "completed" | "failed";
  progress: number;
  error?: string | null;
  transcript?: { language?: string; segments?: WorkerCaption[] } | null;
  downloadPath?: string | null;
};

const workerBase = (import.meta.env.VITE_CAPTIONS_WORKER_URL as string | undefined)?.replace(/\/+$/, "");

function getBase() {
  if (!workerBase) throw new Error("Captions worker is not configured yet. Set VITE_CAPTIONS_WORKER_URL and try again.");
  return workerBase;
}

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(typeof payload.error === "string" ? payload.error : `Captions worker request failed (${response.status}).`);
  return payload as T;
}

export async function uploadCaptionsVideo(file: File): Promise<WorkerJob> {
  if (file.size > 500 * 1024 * 1024) throw new Error("Maximum upload size is 500 MB. Please choose a smaller video.");
  const form = new FormData();
  form.append("video", file);
  return requestJson<WorkerJob>(`${getBase()}/jobs`, { method: "POST", body: form });
}

export async function startCaptionsTranscription(jobId: string, language: string): Promise<WorkerJob> {
  return requestJson<WorkerJob>(`${getBase()}/jobs/${encodeURIComponent(jobId)}/transcribe`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ language }),
  });
}

export async function getCaptionsJob(jobId: string): Promise<WorkerJob> {
  return requestJson<WorkerJob>(`${getBase()}/jobs/${encodeURIComponent(jobId)}`);
}

export async function renderCaptionsMp4(jobId: string, styleId: string, captions: WorkerCaption[]): Promise<WorkerJob> {
  return requestJson<WorkerJob>(`${getBase()}/jobs/${encodeURIComponent(jobId)}/render`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ styleId, captions }),
  });
}

export async function downloadCaptionsMp4(jobId: string): Promise<Blob> {
  const response = await fetch(`${getBase()}/jobs/${encodeURIComponent(jobId)}/download`);
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(typeof payload.error === "string" ? payload.error : "Could not download the captioned MP4.");
  }
  return response.blob();
}

export async function waitForCaptionsJob(
  jobId: string,
  onUpdate: (job: WorkerJob) => void,
  expected: "transcribed" | "completed",
): Promise<WorkerJob> {
  for (;;) {
    await new Promise((resolve) => window.setTimeout(resolve, 1200));
    const job = await getCaptionsJob(jobId);
    onUpdate(job);
    if (job.status === "failed") throw new Error(job.error || "Captions processing failed.");
    if (job.status === expected) return job;
  }
}
