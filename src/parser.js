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
const Bundler = require('parcel-bundler');

const PARCEL_OPTIONS = {
  watch: false,
  contentHash: false
};

async function parseManifest (manifest, sourcePath, outputPath) {
  console.log(manifest);
  const result = findAllFiles(manifest, sourcePath);
  manifest = result.manifest;

  console.log(result);

  const parcelBundle = await runParcel(result.files, outputPath);
  const bundles = extractAllBundles(parcelBundle);

  const assetRemap = new Map(bundles.map(e => [e.entryAsset.name, e.name]));

  return traverseManifest(manifest, value => {
    if (assetRemap.has(value)) {
      const assetPath = assetRemap.get(value);
      return path.relative(outputPath, assetPath);
    }
    return value;
  });
}

function findAllFiles (manifest, sourcePath) {
  const files = [];
  manifest = traverseManifest(manifest, value => {
    if (typeof value === 'string') {
      const inputPath = path.join(sourcePath, value);
      if (fs.existsSync(inputPath)) {
        files.push(inputPath);
        value = inputPath;
      }
    }
    return value;
  });
  return {
    files,
    manifest
  };
}

async function runParcel (files, outputPath) {
  const parcelOptions = Object.assign({
    outDir: outputPath
  }, PARCEL_OPTIONS);
  const bundler = new Bundler(files, parcelOptions);
  return bundler.bundle();
}

function extractAllBundles (parcelBundle) {
  const bundles = new Set();
  const findBundles = entry => {
    Array.from(entry.childBundles).forEach(bundle => {
      if (bundle.entryAsset) {
        bundles.add(bundle);
        findBundles(bundle);
      }
    });
  };
  findBundles(parcelBundle);
  return Array.from(bundles);
}

function traverseManifest (value, visitor) {
  if (typeof value === 'object') {
    if (Array.isArray(value)) {
      return value.map(el => traverseManifest(el, visitor));
    } else {
      const result = {};
      for (const key of Object.keys(value)) {
        result[key] = traverseManifest(value[key], visitor);
      }
      return result;
    }
  }
  return visitor(value);
}

module.exports = {
  parseManifest
};
