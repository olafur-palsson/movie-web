import { ReactNode, useCallback, useMemo, useRef, useState } from "react";

import {
  getCaptionUrl,
  makeCaptionId,
  parseSubtitles,
} from "@/backend/helpers/captions";
import { MWCaption } from "@/backend/helpers/streams";
import { Transition } from "@/components/Transition";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useLoading } from "@/hooks/useLoading";
import { AirplayAction } from "@/video/components/actions/AirplayAction";
import { BackdropAction } from "@/video/components/actions/BackdropAction";
import { CastingTextAction } from "@/video/components/actions/CastingTextAction";
import { ChromecastAction } from "@/video/components/actions/ChromecastAction";
import { FullscreenAction } from "@/video/components/actions/FullscreenAction";
import { HeaderAction } from "@/video/components/actions/HeaderAction";
import { KeyboardShortcutsAction } from "@/video/components/actions/KeyboardShortcutsAction";
import { LoadingAction } from "@/video/components/actions/LoadingAction";
import { MiddlePauseAction } from "@/video/components/actions/MiddlePauseAction";
import { MobileCenterAction } from "@/video/components/actions/MobileCenterAction";
import { PageTitleAction } from "@/video/components/actions/PageTitleAction";
import { PauseAction } from "@/video/components/actions/PauseAction";
import { PictureInPictureAction } from "@/video/components/actions/PictureInPictureAction";
import { ProgressAction } from "@/video/components/actions/ProgressAction";
import { SeriesSelectionAction } from "@/video/components/actions/SeriesSelectionAction";
import { ShowTitleAction } from "@/video/components/actions/ShowTitleAction";
import { SkipTimeAction } from "@/video/components/actions/SkipTimeAction";
import { TimeAction } from "@/video/components/actions/TimeAction";
import { VolumeAction } from "@/video/components/actions/VolumeAction";
import { VideoPlayerError } from "@/video/components/parts/VideoPlayerError";
import { PopoutProviderAction } from "@/video/components/popouts/PopoutProviderAction";
import {
  VideoPlayerBase,
  VideoPlayerBaseProps,
} from "@/video/components/VideoPlayerBase";
import { useVideoPlayerDescriptor } from "@/video/state/hooks";
import { useControls } from "@/video/state/logic/controls";

import { CaptionRendererAction } from "./actions/CaptionRendererAction";
import { DividerAction } from "./actions/DividerAction";
import { NextEpisodeAction } from "./actions/NextEpisodeAction";
import { SettingsAction } from "./actions/SettingsAction";
import { VolumeAdjustedAction } from "./actions/VolumeAdjustedAction";
import { useMeta } from "../state/logic/meta";
import { useSource } from "../state/logic/source";

type Props = VideoPlayerBaseProps;

function CenterPosition(props: { children: ReactNode }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {props.children}
    </div>
  );
}

function LeftSideControls() {
  const descriptor = useVideoPlayerDescriptor();
  const controls = useControls(descriptor);

  const handleMouseEnter = useCallback(() => {
    controls.setLeftControlsHover(true);
  }, [controls]);
  const handleMouseLeave = useCallback(() => {
    controls.setLeftControlsHover(false);
  }, [controls]);

  return (
    <>
      <div
        className="flex items-center px-2"
        onMouseLeave={handleMouseLeave}
        onMouseEnter={handleMouseEnter}
      >
        <PauseAction />
        <SkipTimeAction />
        <VolumeAction className="mr-2" />
        <TimeAction />
      </div>
      <ShowTitleAction />
    </>
  );
}

export function VideoPlayer(props: Props) {
  const [show, setShow] = useState(false);
  const { isMobile } = useIsMobile();

  const onBackdropChange = useCallback(
    (showing: boolean) => {
      setShow(showing);
    },
    [setShow]
  );

  // const descriptor = useVideoPlayerDescriptor();
  // const meta = useMeta(descriptor);
  // const controls = useControls(descriptor);

  // const englishCaption = useMemo(
  //   () =>
  //     meta?.captions.find((caption) =>
  //       caption.langIso.toLowerCase().startsWith("en")
  //     ),
  //   [meta]
  // );

  // const loadingId = useRef<string>("");
  // const [setCaption, loading, error] = useLoading(
  //   async (caption: MWCaption, isLinked: boolean) => {
  //     const id = makeCaptionId(caption, isLinked);
  //     loadingId.current = id;
  //     const blobUrl = await getCaptionUrl(caption);
  //     const result = await fetch(blobUrl);
  //     const text = await result.text();
  //     parseSubtitles(text); // This will throw if the file is invalid
  //     controls.setCaption(id, blobUrl);
  //     // sometimes this doesn't work, so we add a small delay
  //     setTimeout(() => {
  //       controls.closePopout();
  //     }, 100);
  //   }
  // );

  // if (englishCaption) {
  //   setCaption(englishCaption, true);
  // }

  return (
    <VideoPlayerBase
      autoPlay={props.autoPlay}
      includeSafeArea={props.includeSafeArea}
      onGoBack={props.onGoBack}
    >
      {({ isFullscreen }) => (
        <>
          <KeyboardShortcutsAction />
          <PageTitleAction />
          <VolumeAdjustedAction />
          <VideoPlayerError onGoBack={props.onGoBack}>
            <BackdropAction onBackdropChange={onBackdropChange}>
              <CenterPosition>
                <LoadingAction />
              </CenterPosition>
              <CenterPosition>
                <CastingTextAction />
              </CenterPosition>
              <CenterPosition>
                <MiddlePauseAction />
              </CenterPosition>
              {isMobile ? (
                <Transition
                  animation="fade"
                  show={show}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <MobileCenterAction />
                </Transition>
              ) : (
                ""
              )}
              <Transition
                animation="slide-down"
                show={show}
                className="pointer-events-auto absolute inset-x-0 top-0 flex flex-col px-8 py-6 pb-2"
              >
                <HeaderAction
                  showControls={isMobile}
                  onClick={props.onGoBack}
                  isFullScreen
                />
              </Transition>
              <Transition
                animation="slide-up"
                show={show}
                className={[
                  "pointer-events-auto absolute inset-x-0 bottom-0 flex flex-col px-4 pb-2",
                  props.includeSafeArea || isFullscreen
                    ? "[margin-bottom:env(safe-area-inset-bottom)]"
                    : "",
                ].join(" ")}
              >
                <div className="flex w-full items-center space-x-3">
                  {isMobile && <TimeAction noDuration />}
                  <ProgressAction />
                </div>
                <div className="flex items-center">
                  {isMobile ? (
                    <div className="grid w-full grid-cols-[56px,1fr,56px] items-center">
                      <div />
                      <div className="flex items-center justify-center">
                        <SeriesSelectionAction />
                        <NextEpisodeAction />
                        <PictureInPictureAction />
                        <SettingsAction />
                      </div>
                      <FullscreenAction />
                    </div>
                  ) : (
                    <>
                      <LeftSideControls />
                      <div className="flex-1" />
                      <SeriesSelectionAction />
                      <NextEpisodeAction />
                      <DividerAction />
                      <SettingsAction />
                      <ChromecastAction />
                      <AirplayAction />
                      <PictureInPictureAction />
                      <FullscreenAction />
                    </>
                  )}
                </div>
              </Transition>
              {show ? <PopoutProviderAction /> : null}
            </BackdropAction>
            <CaptionRendererAction isControlsShown={show} />
            {props.children}
          </VideoPlayerError>
        </>
      )}
    </VideoPlayerBase>
  );
}
