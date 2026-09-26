import { UploadScreen } from "@/features/analysis-flow/upload-screen";
import {
  SafetyCheckScreen,
  type SafetyCheckSource,
} from "@/features/analysis-flow/safety-check-screen";

export default async function UploadPage({ searchParams }: PageProps<"/upload">) {
  const params = await searchParams;
  const source: SafetyCheckSource =
    params.source === "dashcam" ? "dashcam" : "pedestrian";

  if (params.step !== "select") {
    return <SafetyCheckScreen source={source} />;
  }

  return <UploadScreen />;
}
