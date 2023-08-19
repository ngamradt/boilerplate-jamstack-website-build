# Jamstack Website Build Lambda Repository Overview

The source code for a [Node.js](https://nodejs.dev/en/) [AWS Lambda](https://aws.amazon.com/lambda/) which is used to build an [Eleventy (11ty)](https://www.11ty.dev) [Jamstack](https://jamstack.org) site as part of an [AWS CodePipeline](https://aws.amazon.com/codepipeline/).

Eleventy has a focus on slow and steady development which helps with the stability of the deployment process.  Because of this, updates to this repository will only be needed periodically to leverage the lates 11ty features.

There is a related blog post regarding [why I chose 11ty](https://nealgamradt.com/posts/2023/07/choosing-a-jamstack/index.html) for my blog.

---
**NOTE**

It is recommended that this repository not be used directly, the "Use this template" button should be utilized to create your own copy of this repository.  This will allow you to make modifications to this Lambda and CloudFormation template as you need them.  When there are enhancements to the source repository, you can always pull them in as needed.

---

## Table of Contents

- [Current Lambda Version Details](#current-lambda-version-details)
- [Related Repositories](#related-repositories)
- [License](#license)

---

# Current Lambda Version Details

More details about the current Node.js application can be found in the [README.md file](v1/README.md) for the current version.

# Related Repositories

This repository is part of a small group of repositories that are used together in order to deploy a simple 11ty Jamstack website.  Here is the list of related repositories:

1. [Jamstack Website Core](https://github.com/ngamradt/boilerplate-jamstack-website): This repository is the core repository that stitches everything together.  It houses the following components:
    - The main AWS CodePipeline that will deploy all infrastructure and the Jamstack website itself.
    - All needed CloudFormation templates to create the required infrastructure.
    - The 11ty liquid templates for the structure of the website.
    - The supporting CSS and JavaScript files for the Jamstack site.
    - All of the source content files for each blog post.
2. [Jamstack Website Tools](https://github.com/ngamradt/boilerplate-jamstack-website-tools): This repository has any supporting tools for the Jamstack website.
3. [Jamstack Website Build](https://github.com/ngamradt/boilerplate-jamstack-website-build) (this repository): This repository has the Lambda function that is used to produce the 11ty dynamic pages.
4. [Jamstack Website Static Resources](https://github.com/ngamradt/boilerplate-jamstack-website-static): This repository has all large static files that are used either by the site in general, or by the individual posts.  These files are kept separate in order to keep the build process fast and easy.

These repositories are part of my ["Blog on a Budget" series](https://nealgamradt.com/posts/2023/06/blog-on-a-budget-overview/index.html).  View that blog post series for more details on how these repositories all work together.

# License

This repository is released under [the MIT license](https://en.wikipedia.org/wiki/MIT_License).  View the [local license file](./LICENSE).