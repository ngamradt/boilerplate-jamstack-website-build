# 11ty Build Lambda Overview

The Lambda in this repository will be deployed by an AWS CodePipeline and then used by an AWS CodePipeline to build a simple [11ty Jamstack](https://www.11ty.dev) website.

This directory holds the source code and CloudFormation templates for deploying this Lambda using Infrastructure as Code.

---

## Table of Contents

- [Directory Structure](#directory-structure)
- [Installation](#installation)
- [Function Details](#function-details)
- [TODO Items](#todo-items)

---

# Directory Structure

This section describes the layout of the `v1` version of this project.

- [`env`](env): Any environment-related override files used by CodePipeline CloudFormation stages.
    * Currently there is a single placeholder file for the Lambda template, but this could be updated to have different files for different deployment environments.
    * Override and configuration files, in this directory, should be categorized by AWS service to try to make finding and updating files easy.
    * This directory could also contain other environment configuration files for the Lambda application itself, if needed.
- [`iac`](iac): Any infrastructure as Code (IaC) templates.
    * Currently this only contains a CloudFormation YAML template for deploying the Lambda.
    * This CloudFormation template will be used by CodePipeline to deploy the Lambda function.
    * Templates in this directory should be categorized by AWS service to try to make finding and updating infrastructure easy.
    * This directory could also contain templates for other IaC solutions.
- [`node_modules`](node_modules): Node.js modules that the Lambda needs to function.
    * Because this is a very simple deployment process where we want to keep deployments fast, it is easiest to just store a copy of the module dependencies in this repository.  This does make the repository bigger, but allows for a direct deployment from the repository.
    * This has a secondary advantage of not running into deployment issues if there is a problem pulling in the required Node.js modules.
    * Long-term, we may add some functionality to dynamically pull in these modules during the build process (if updating the dependencies get to large).
    * **NOTE:** When updating this directory, it is one of the rare times that it may be best to push directly to `main` as the list of changes in the Pull Request (PR) can get massive.
- [`src`](src): The source files needed for the Lambda application.
    * This directory currently has a single Node.js source file for the build process.
- [`version root`](./): All of the files that are generally designed to be at the base of the project.
    * 11ty-related files, such as the `eleventy.config.cjs` configuration file (used by 11ty at runtime).
    * Node.js-related files, such as the `package-lock.json` and `package.json` file.
    * Miscellaneous files, such as the `README.md` file.

# Installation

Though it should be possible to deploy the [CloudFormation template](iac/cfn/lambda/function.yaml) for this Lambda function using the console, this is intended to be deployed using [AWS CodePipeline](https://aws.amazon.com/codepipeline/).  Specifically, the CodePipeline in the [Jamstack Website boilerplate](https://github.com/ngamradt/boilerplate-jamstack-website) repository will be expecting to pull in this repository and deploy this function to the same region as the CodePipeline.

Since [one of the goals](https://nealgamradt.com/posts/2023/06/blog-on-a-budget-goals-and-requirements/index.html) is to keep things affordable for this whole project, instead of having multiple CodePipelines for deploying this function and building the 11ty site, it was decided to create one "polymorphic" CodePipeline that can change its stages based on some flags that are either enabled or disabled.  This allows for the use of one ([free tier](https://aws.amazon.com/free/)) CodePipeline that we can use to do all the different functions that we need.

> [!NOTE]
> The use of the "polymorphic" CodePipeline is mainly there to save money.  CodePipelines are not that expensive, so admittedly this is being really cheap.  This is probably not great practice unless you are really trying to save money.  That being said, it does work, and generally works rather well as long as you know when and why to enable the different flags to switch the CodePipeline to a different state.

# Function Details

This function does the following:

1. It downloads the input artifact ZIP file from the S3 bucket for the CodePipeline stage.
2. It extracts the ZIP file to the local `/tmp/` directory of the Lambda.
    - **NOTE:** This directory has a 512MB limit, so do keep that in mind.
    - Even with this size limit and even if articles are large, this should likely allow for thousands of posts before this size limit becomes an issue.
3. Depending on the mode passed into the Lambda, the next step does one of the following:
    - Builds the 11ty blog post HTML files.
    - Does a copy of some of the supporting files, such as CSS and JavaScript, for the site.
4. The resulting files of either of the modes in step #3 are then zipped into a single ZIP file.
5. The ZIP file is uploaded to the correct output location for the CodePipeline stage.
6. The function then reports success or failure back to the CodePipeline.
7. If failure is reported back, then the CodePipeline stage will fail.
8. If success is reported back, then the CodePipeline will move to the next stage.

# TODO Items

1. Make S3 permissions more restrictive.
2. Go through the function and look to see if any further clean-up can be done.
3. Add in the the details for local testing of the function (once these details are verified).  The initial local development process wasn't documented well and needs to be revisited for completeness of instructions before being added to the public repository.
4. Add more website collections to the 11ty configuration.  Make sure that these collections are being done efficiently.