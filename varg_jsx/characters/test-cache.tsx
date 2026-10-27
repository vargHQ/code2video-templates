/** @jsxImportSource vargai */
// Minimal test: Speech segments + VEED cache test
// Run twice — second run should be all cache hits.
import { Speech, Video, Clip, Render } from "vargai/react";
import { createVarg, elevenlabs } from "vargai/ai";

const varg = createVarg({ apiKey: process.env.VARG_API_KEY! });

const VOICE = "jqcCZkN6Knx8BJ5TBdYR";
const REF_IMAGE = "https://s3.varg.ai/person.png";

const { audio, segments } = await Speech({
  model: elevenlabs.speechModel("eleven_v3"),
  voice: VOICE,
  children: [
    "Hello, I'm Sarah.",
    "Here are three examples of my campaigns.",
  ],
});

const VEED = varg.videoModel("veed-fabric-1.0");

const talkingVid = await Video({
  model: VEED,
  keepAudio: false,
  prompt: { images: [REF_IMAGE], audio: segments[0] },
  providerOptions: { varg: { resolution: "720p" } },
});

export default (
  <Render width={1080} height={1920}>
    <Clip duration={segments[0]!.duration}>
      {talkingVid}
      {segments[0]}
    </Clip>
    <Clip duration={segments[1]!.duration}>
      {talkingVid}
      {segments[1]}
    </Clip>
  </Render>
);
