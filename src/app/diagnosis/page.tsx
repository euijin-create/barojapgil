import DiagnosisView from "@/features/report-flow/diagnosis-view";
import EvidenceDiagnosisView from "@/features/report-flow/evidence-diagnosis-view";
import HumanReviewView from "@/features/report-flow/human-review-view";

export default async function DiagnosisPage({
  searchParams,
}: PageProps<"/diagnosis">) {
  const params = await searchParams;

  if (params.step === "review") {
    return <HumanReviewView />;
  }

  if (params.step === "evidence") {
    return <EvidenceDiagnosisView />;
  }

  return <DiagnosisView />;
}
