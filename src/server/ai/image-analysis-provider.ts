import "server-only";

import {
  ProviderConfigurationError,
  type AnalysisProviderName,
  type ImageAnalysisProvider,
} from "@/application/ports/image-analysis-provider";
import { MockImageAnalysisProvider } from "@/infrastructure/ai/mock-image-analysis-provider";
import { OpenAIImageAnalysisProvider } from "@/infrastructure/ai/openai-image-analysis-provider";

export interface ImageAnalysisProviderSelection {
  provider: ImageAnalysisProvider;
  name: AnalysisProviderName;
  isDemo: boolean;
}

export function getImageAnalysisProvider(): ImageAnalysisProviderSelection {
  const configuredProvider = process.env.ANALYSIS_PROVIDER?.trim().toLowerCase();
  const providerName = configuredProvider || "mock";

  if (providerName === "mock") {
    return {
      provider: new MockImageAnalysisProvider(),
      name: "mock",
      isDemo: true,
    };
  }

  if (providerName === "openai") {
    return {
      provider: new OpenAIImageAnalysisProvider({
        apiKey: process.env.OPENAI_API_KEY,
        model: process.env.OPENAI_MODEL,
      }),
      name: "openai",
      isDemo: false,
    };
  }

  throw new ProviderConfigurationError(
    `Unsupported ANALYSIS_PROVIDER value: ${providerName}. Expected "mock" or "openai".`,
  );
}

export {
  AnalysisProviderError,
  AnalysisUnavailableError,
  ImageAnalysisProviderError,
  ProviderConfigurationError,
} from "@/application/ports/image-analysis-provider";
