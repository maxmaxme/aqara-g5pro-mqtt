import assert from "node:assert/strict";
import test from "node:test";
import { cloudPtz, usesCloudPtz } from "../aqara.js";

test("only the Camera Hub G3 models route PTZ through the cloud", () => {
  assert.equal(usesCloudPtz("lumi.camera.gwpgl1"), true);
  assert.equal(usesCloudPtz("lumi.camera.gwpagl01"), true);
  assert.equal(usesCloudPtz("lumi.camera.acn006"), false);
  assert.equal(usesCloudPtz("lumi.camera.agl004"), false);
  assert.equal(usesCloudPtz(""), false);
});

test("cloud PTZ sends ctrl_ptz and surfaces a rejection", async () => {
  const calls: Array<[string, unknown]> = [];
  await cloudPtz("did.fixture", "left", async (url, body) => {
    calls.push([url, body]);
    return { data: { code: 0 } };
  });
  assert.deepEqual(calls, [
    [
      "/app/v1.0/lumi/devex/camera/operate",
      { did: "did.fixture", method: "ctrl_ptz", params: { action: "left" } },
    ],
  ]);
  await assert.rejects(
    cloudPtz("did.fixture", "up", async () => ({ data: { code: 302 } })),
    /code=302/,
  );
});
