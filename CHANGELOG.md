# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## Types of changes

- **Added** for new features.
- **Changed** for changes in existing functionality.
- **Deprecated** for soon-to-be removed features.
- **Removed** for now removed features.
- **Fixed** for any bug fixes.
- **Security** in case of vulnerabilities.

## Unreleased

- When an API call does not contain a `Request Body` or `Request Variables` a informational message will be shown instead of `null` or `{}` message. ([Issue 4](https://github.com/rubrikinc/api-capture-chrome-extension/issues/4))

## v0.2.0 (Beta)

- Categorize GraphQL API calls as either a `QUERY` or a `MUTATION` ([Issue 3](https://github.com/rubrikinc/api-capture-chrome-extension/issues/3))
- Add support for logging API calls from Polaris ([Issue 1](https://github.com/rubrikinc/api-capture-chrome-extension/issues/1))
- Format the GraphQL request body output so that it is human readable ([Issue 5](https://github.com/rubrikinc/api-capture-chrome-extension/issues/5))
- Add the ability to view GraphQL request variables ([Issue 5](https://github.com/rubrikinc/api-capture-chrome-extension/issues/5))

## v0.1.0 (Beta)

### Added

- Monitor network traffic for API calls made from the Rubrik CDM UI and then list each call detected
- View the Rubrik API calls Response and Request Bodies
