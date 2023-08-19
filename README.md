# Jamstack Website Build Lambda Repository

The source code for a [Node.js](https://nodejs.dev/en/) [AWS Lambda](https://aws.amazon.com/lambda/) which is used to build an [Eleventy (11ty)](https://www.11ty.dev) [Jamstack](https://jamstack.org) site as part of an [AWS CodePipeline](https://aws.amazon.com/codepipeline/).

Eleventy has a focus on slow and steady development which helps with the stability of the deployment process.  Because of this, updates to this repository will only be needed periodically to leverage the lates 11ty features.

There is a related blog post regarding [why I chose 11ty](https://nealgamradt.com/posts/2023/07/choosing-a-jamstack/index.html) for my blog.

---
**NOTE**

It is recommended that this repository not be used directly, the "Use this template" button should be utilized to create fork of this repository.  This will allow you to make modifications to this Lambda and CloudFormation template as you need them.  If there are enhancements from the source repository, you can always pull them in as needed.

---

## Table of Contents

- [Current Lambda Version Details](#current-lambda-version-details)
- [License](#license)

# Current Lambda Version Details

More details about the current Node.js application can be found in the [README.md file](v1/README.md) for the current version.

# License

This repository is released under [the MIT license](https://en.wikipedia.org/wiki/MIT_License).  View the [local license file](./LICENSE).