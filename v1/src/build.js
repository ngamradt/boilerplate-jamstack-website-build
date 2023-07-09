// Copyright (c) Neal Gamradt. All rights reserved. Licensed under the MIT license.
// See the LICENSE file for license information.

import Eleventy from "@11ty/eleventy";
import wz from "w-zip";
import AWS from "aws-sdk";
import fs from "fs";
import process from "process";

//This should eventually become a parameter for the function.
const codepipeline = new AWS.CodePipeline(),
      baseDirectory = process.cwd(),
      configPath = "/v1/eleventy.config.cjs",
      inputFile = "/tmp/input.zip",
      inputDirectory = "/tmp/input",
      outputFile = "/tmp/output.zip",
      outputDirectory = "/tmp/content";

//Set some variables.
var codepipelineData = {};

async function build(context,s3) {

    console.info("Starting the 11ty build.");

    const elev = new Eleventy(`${inputDirectory}${codepipelineData.params.directory}`, outputDirectory, {quietMode: false,configPath: `${baseDirectory}${configPath}`});

    try {

        const initFinish = await elev.init();
        const writeFinish = await elev.write();

        console.log("11ty Build Success");

        create(context,s3);

    } catch (err) {

        console.error(err);

        putJobFailure(context, "11ty build failed.");

    }

}

function cleanup(context,s3) {

    function resultInputFile(err) {

        if (err) {

            console.log(`Failure to delete: ${err}`);

            putJobFailure(context, "Failure to delete.");

            throw err;

        }

        console.info("Delete output ZIP.");

        fs.rm(outputFile,resultOutputFile);
    }

    function resultOutputFile(err) {

        if (err) {

            console.log(`Failure to delete: ${err}`);

            putJobFailure(context, "Failure to delete.");

            throw err;

        }

        console.info("Delete input directory.");

        fs.rm(inputDirectory,{recursive: true, force: true},resultInputDirectory);
    }

    function resultInputDirectory(err) {

        if (err) {

            console.log(`Failure to delete: ${err}`);

            putJobFailure(context, "Failure to delete.");

            throw err;

        }

        console.info("Delete output directory.");

        fs.rm(outputDirectory,{recursive: true, force: true},resultOutputDirectory);
    }

    function resultOutputDirectory(err) {

        if (err) {

            console.log(`Failure to delete: ${err}`);

            putJobFailure(context, "Failure to delete.");

            throw err;

        }

        putJobSuccess(context, "11ty site built and uploaded.");
    }

    console.info("Delete input ZIP.");

    fs.rm(inputFile,resultInputFile);

}

async function copy(context,s3) {

    console.info(`Copy ${inputDirectory}${codepipelineData.params.directory} to ${outputFile}`);

    try {

        var filenames = fs.readdirSync(`${inputDirectory}${codepipelineData.params.directory}`);

        console.log("Input Static Directory Contents:");
    
        filenames.forEach(file => {
            console.log(file);
        });

        await wz.mZip.zipFolder(`${inputDirectory}${codepipelineData.params.directory}`,outputFile);

        console.log(`Successfully created ${outputFile}.`);

    } catch (err) {

        console.log(`Failure to create ZIP file: ${err}`);

        putJobFailure(context, "Failure to create ZIP file.");

    }

    upload(context,s3);

}

async function create(context,s3) {

    console.info("Starting the creation of the output ZIP archive.");

    try {

        //Check if the output folder exists, if not, create it.
        if (!fs.existsSync(outputDirectory)) {
            fs.mkdirSync(outputDirectory);
        }

    } catch (err) {

        console.error(err);

        putJobFailure(context, "Could not create directory.");

    }

    try {

        //zip.addLocalFolder(outputDirectory);
        //zip.writeZip(outputFile);

        await wz.mZip.zipFolder(outputDirectory,outputFile);

        console.log(`Successfully created ${outputFile}.`);

    } catch (err) {

        console.log(`Failure to create ZIP file: ${err}`);

        putJobFailure(context, "Failure to create ZIP file.");

    }

    upload(context,s3);

}

async function download(context,s3) {

    console.info("Starting input archive download.");

    try {

        function result(err) {

            if (err) {

                console.log(`Failure to download from S3: ${err}`);

                putJobFailure(context, "Failure to download from S3.");

                throw err;

            }

            console.log("File downloaded successfully.");

            extract(context,s3);

        }

        // Setting up S3 upload parameters
        const s3params = {
            Bucket: codepipelineData.input.bucket,
            Key: codepipelineData.input.objectKey
        };

        const { Body } = await s3.getObject(s3params).promise();

        fs.writeFile(inputFile, Body, result);

    } catch (err) {

        putJobFailure(context, "Failure to download from S3.");

    }

}

async function extract(context,s3) {

    console.info("Starting extraction of ZIP archive.");

    try {

        await wz.mZip.unzip(inputFile, inputDirectory);

        console.log(`Successfully extracted ${inputFile}.`);

        if (codepipelineData.params.mode == "build") {

            console.log("The script is in the \"build\" mode...");

            //Run the 11ty build.
            build(context,s3);

        } else {

            console.log("The script is in the \"copy\" mode...");

            //Simply grab the files that we need.
            copy(context,s3);

        }


    } catch (err) {

        console.log(`Failure to create ZIP file: ${err}`);

        putJobFailure(context, "Failure to create ZIP file.");

    }

}

function getCodePipelineData(event,data) {

    //JavaScript data.
    data.jobId = event["CodePipeline.job"].id;

    var jobData = event["CodePipeline.job"].data,
        jobConfig = jobData["actionConfiguration"].configuration,
        jobCredentials = jobData.artifactCredentials,
        jobInputArtifact = jobData.inputArtifacts[0],
        jobOutputArtifact = jobData.outputArtifacts[0];

    data.input = {bucket:jobInputArtifact.location.s3Location.bucketName,objectKey:jobInputArtifact.location.s3Location.objectKey};
    data.output = {bucket:jobOutputArtifact.location.s3Location.bucketName,objectKey:jobOutputArtifact.location.s3Location.objectKey};
    data.keyId = jobCredentials.accessKeyId;
    data.keySecret = jobCredentials.secretAccessKey;
    data.sessionToken = jobCredentials.sessionToken;
    data.params = JSON.parse(jobConfig.UserParameters);
}

function putJobSuccess(context,message) {

    console.log(`Job ID: ${codepipelineData.jobId}`);

    var params = {
        jobId: codepipelineData.jobId
    };
  
    codepipeline.putJobSuccessResult(params, function(err, data) {
        if(err) {
            context.fail(err);
        } else {
            context.succeed(message);
        }
    });

};
  
function putJobFailure(context,message) {

    console.log(`Job ID: ${codepipelineData.jobId}`);
    console.log(`Request ID: ${context.awsRequestId}`);

    var params = {
        jobId: codepipelineData.jobId,
        failureDetails: {
            message: JSON.stringify(message),
            type: 'JobFailed',
            externalExecutionId: context.awsRequestId
        }
    };

    codepipeline.putJobFailureResult(params, function(err, data) {
        context.fail(message);    
    });

};

function upload(context,s3) {

    console.info("Starting the upload of the output ZIP archive.");

    try {

        // Read content from the file
        const fileContent = fs.readFileSync(outputFile);

        // Setting up S3 upload parameters
        const s3params = {
            Bucket: codepipelineData.output.bucket,
            Key: codepipelineData.output.objectKey, // File name you want to save as in S3
            Body: fileContent
        };

        // Uploading files to the bucket
        s3.upload(s3params, function(err, data) {

            if (err) {

                console.log(`Failure to upload to S3: ${err}`);

                putJobFailure(context, "Failure to upload to S3.");

                throw err;

            }

            console.log(`File uploaded successfully: ${data}`);

            cleanup(context,s3);

        });

    } catch (err) {

        putJobFailure(context, "Failure to upload to S3.");

    }

}

export const handler = function run(event, context, callback) {

    getCodePipelineData(event,codepipelineData);

    const s3 = new AWS.S3({
        accessKeyId: codepipelineData.keyId,
        secretAccessKey: codepipelineData.keySecret,
        sessionToken: codepipelineData.sessionToken,
        region: process.env.LOCAL_AWS_REGION
    });

    download(context,s3);

}