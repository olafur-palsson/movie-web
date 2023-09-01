import { useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";

import {
  getCaptionUrl,
  makeCaptionId,
  parseSubtitles,
} from "@/backend/helpers/captions";
import { MWCaption } from "@/backend/helpers/streams";
import { Icons } from "@/components/Icon";
import { FloatingAnchor } from "@/components/popout/FloatingAnchor";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useLoading } from "@/hooks/useLoading";
import { VideoPlayerIconButton } from "@/video/components/parts/VideoPlayerIconButton";
import { useVideoPlayerDescriptor } from "@/video/state/hooks";
import { useControls } from "@/video/state/logic/controls";
import { useInterface } from "@/video/state/logic/interface";
import { useMeta } from "@/video/state/logic/meta";

interface Props {
  className?: string;
}

const hasCaption = false;
let lastEpisode = "";

export function SettingsAction(props: Props) {
  const { t } = useTranslation();
  const descriptor = useVideoPlayerDescriptor();
  const controls = useControls(descriptor);
  const videoInterface = useInterface(descriptor);
  const { isMobile } = useIsMobile(false);

  const meta = useMeta(descriptor);

  const englishCaption = useMemo(
    () =>
      meta?.captions.find((caption) =>
        caption.langIso.toLowerCase().startsWith("en")
      ),
    [meta]
  );

  const loadingId = useRef<string>("");
  const [setCAptionAndPlay, loading, error] = useLoading(
    async (caption: MWCaption, isLinked: boolean) => {
      const id = makeCaptionId(caption, isLinked);
      loadingId.current = id;
      const blobUrl = await getCaptionUrl(caption);
      const result = await fetch(blobUrl);
      const text = await result.text();
      parseSubtitles(text); // This will throw if the file is invalid
      controls.setCaption(id, blobUrl);
      controls.play();
    }
  );

  if (
    englishCaption &&
    meta?.episode?.episodeId &&
    lastEpisode !== meta?.episode.episodeId
  ) {
    lastEpisode = meta?.episode.episodeId;
    setTimeout(() => {
      setCAptionAndPlay(englishCaption, true);
    }, 3000);
  }

  return (
    <div className={props.className}>
      <div className="relative">
        <FloatingAnchor id="settings">
          <VideoPlayerIconButton
            active={videoInterface.popout === "settings"}
            className={props.className}
            onClick={() => controls.openPopout("settings")}
            text={
              isMobile
                ? (t("videoPlayer.buttons.settings") as string)
                : undefined
            }
            icon={Icons.GEAR}
          />
        </FloatingAnchor>
      </div>
    </div>
  );
}
