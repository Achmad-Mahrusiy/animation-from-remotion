import { Still } from "remotion";
import { MyComposition } from "./Composition";
import { ProfilePicture } from "./ProfilePicture";
import { AotCompositions } from "./aot/AotShorts";
import { CavemanComposition } from "./caveman/CavemanVideo";
import { CompactComposition } from "./compact/CompactVideo";
import { GrillComposition } from "./grill/GrillVideo";
import { LeaksComposition } from "./leaks/LeaksVideo";
import { MotionComposition } from "./motion/MotionVideo";
import { PonytailComposition } from "./ponytail/PonytailVideo";
import { SuperpowersComposition } from "./superpowers/SuperpowersVideo";
import { StarterComposition } from "./starter/StarterVideo";
import { PenthouseComposition } from "./penthouse/PenthouseVideo";
import { PenthouseV2Composition } from "./penthouse2/PenthouseV2";
import { EccComposition } from "./ecc/EccVideo";
import { UiuxComposition } from "./uiux/UiuxVideo";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <MyComposition />
      <PonytailComposition />
      <CavemanComposition />
      <MotionComposition />
      <SuperpowersComposition />
      <LeaksComposition />
      <UiuxComposition />
      <CompactComposition />
      <GrillComposition />
      <StarterComposition />
      <PenthouseComposition />
      <PenthouseV2Composition />
      <EccComposition />
      <AotCompositions />
      <Still
        id="ProfilePicture"
        component={ProfilePicture}
        width={1080}
        height={1080}
      />
    </>
  );
};
