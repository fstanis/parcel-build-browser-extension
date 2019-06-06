# parcel-build-browser-extension

A simple CLI that allows you to use [Parcel.js](https://parceljs.org/) to build
browser extensions.

It allows you to use a WebExtensions-compatible [manifest.json](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json)
file as input for Parcel.js, allowing to easily apply transformations to HTML,
JS and CSS files that Parcel.js supports.

For example, you may use TypeScript `.ts` files for your background script or
SASS for your styles.

## Installation

Install using `npm i -g parcel-build-browser-extension`.

Alternatively, you can use npx to run without installing globally.

## Usage

```bash
npx parcel-build-browser-extension \
    --source-path <path> \
    --output-path [path] \
    --package-json [path]
```

### Flags

#### --source-path

Specifies the folder with the source files of the extension.

Must contain a file named `manifest.json`.

#### --output-path

Optional: specifies the output path.

Defaults to `dist`.

#### --package-json

Optional: specifies the location of `package.json`.

If present, the tool will try to pull properties with the value
`__FROM_PACKAGE_JSON` from it.

For example, your `manifest.json` may look like this:

```json
{
  "manifest_version": 2,
  "name": "__FROM_PACKAGE_JSON",
  "version": "__FROM_PACKAGE_JSON",
  "description": "My extension!",
  ...
}
```

In this case, `name` and `version` will be pulled from the `package.json` file
specifies via this flag.
