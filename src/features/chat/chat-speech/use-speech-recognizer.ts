import { useGlobalMessageContext } from "@/features/global-message/global-message-context";
import {
  AudioConfig,
  AutoDetectSourceLanguageConfig,
  SpeechConfig,
  SpeechRecognizer,
} from "microsoft-cognitiveservices-speech-sdk";
import { useRef, useState } from "react";
import { GetSpeechToken } from "./speech-service";

export const useSpeechRecognizer = () => {
  const recognizerRef = useRef<SpeechRecognizer>();

  const [speech, setSpeech] = useState("");
  const [isMicrophoneUsed, setIsMicrophoneUsed] = useState(false);

  const { showError } = useGlobalMessageContext();

  const startRecognition = async () => {
    const token = await GetSpeechToken();

    if (token.error) {
      showError(token.errorMessage);
      return;
    }

    setIsMicrophoneUsed(true);
    const speechConfig = SpeechConfig.fromAuthorizationToken(
      token.token,
      token.region
    );

    const audioConfig = AudioConfig.fromDefaultMicrophoneInput();

    const autoDetectSourceLanguageConfig =
      AutoDetectSourceLanguageConfig.fromLanguages([
        "en-US",
        "zh-CN",
        "it-IT",
        "pt-BR",
      ]);

    const recognizer = SpeechRecognizer.FromConfig(
      speechConfig,
      autoDetectSourceLanguageConfig,
      audioConfig
    );

    recognizerRef.current = recognizer;

    recognizer.recognizing = (s, e) => {
      setSpeech(e.result.text);
    };

    recognizer.canceled = (s, e) => {
      showError(e.errorDetails);
    };

    recognizer.startContinuousRecognitionAsync();
  };

  const setSpeechText = (text: string) => {
    setSpeech(text);
  };

  const stopRecognition = () => {
    recognizerRef.current?.stopContinuousRecognitionAsync();
  };

  const resetMicrophoneUsed = () => {
    setIsMicrophoneUsed(false);
  };

  return {
    startRecognition,
    stopRecognition,
    speech,
    setSpeechText,
    isMicrophoneUsed,
    resetMicrophoneUsed,
  };
};