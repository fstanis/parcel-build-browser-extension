// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const fs = require('fs');
const path = require('path');

const { parseManifest } = require('./parser');

const MANIFEST_FILENAME = 'manifest.json';
const FROM_PACKAGE_JSON = '__FROM_PACKAGE_JSON';

async function buildExtension (sourcePath, outputPath, packageJsonPath) {
  sourcePath = path.resolve(sourcePath);
  outputPath = path.resolve(outputPath);

  const manifestPath = path.join(sourcePath, MANIFEST_FILENAME);
  if (!fs.existsSync(manifestPath)) {
    throw new Error(`No manifest.json found in ${sourcePath}`);
  }
  let manifest = await readJsonFromFile(manifestPath);

  let packageJson;
  if (packageJsonPath) {
    if (!packageJsonPath.match(/\\bpackage\.json$/)) {
      throw new Error('package.json file must be named "package.json"');
    }
    if (!fs.existsSync(packageJsonPath)) {
      throw new Error('Path to package.json is invalid');
    }

    packageJson = await readJsonFromFile(packageJsonPath);
  }

  manifest = await processManifest(manifest, packageJson, sourcePath, outputPath);
  const manifestOutput = path.join(outputPath, MANIFEST_FILENAME);
  fs.writeFileSync(manifestOutput, JSON.stringify(manifest));
}

async function processManifest (manifest, packageJson, sourcePath, outputPath) {
  if (packageJson) {
    manifest = margePackageJson(manifest, packageJson);
  }

  return parseManifest(manifest, sourcePath, outputPath);
}

function margePackageJson (manifest, packageJson) {
  manifest = Object.assign({}, manifest);
  for (const key of Object.keys(manifest)) {
    let value = manifest[key];
    if (value === FROM_PACKAGE_JSON) {
      if (!(key in packageJson)) {
        throw new Error(`Key ${key} not found in package.json, but has ${FROM_PACKAGE_JSON} value in manifest.json`);
      }
      value = packageJson[key];
    }
    manifest[key] = value;
  }
  return manifest;
}

async function readJsonFromFile (path) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(JSON.parse(data));
    });
  });
}

module.exports = { buildExtension };
