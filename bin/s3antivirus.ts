#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { S3AntivirusStack } from '../lib/s3antivirus-stack';
import { BuildConfig }  from '../lib/build-config';
import * as fs from 'fs';
import * as path from 'path';
import { Tags } from '@aws-cdk/core';
const yaml = require('js-yaml');

const app = new cdk.App();



function ensureString(object: { [name: string]: any }, propName: string ): string
{
    if(!object[propName] || object[propName].trim().length === 0)
        throw new Error(propName +" does not exist or is empty");

    return object[propName];
}

function getConfig() {
  let env = app.node.tryGetContext('config');
  if (!env) {
    throw new Error('Context variable missing on CDK command. Pass in as \'-c config=xxx\'');
  }

  let unparsedEnv = yaml.load(fs.readFileSync(path.resolve("./config/"+env+".yaml"), "utf8"));

  let buildConfig: BuildConfig = {
      AWSAccountID: ensureString(unparsedEnv, 'AWSAccountID'),
      AWSProfileName: ensureString(unparsedEnv, 'AWSProfileName'),
      AWSProfileRegion: ensureString(unparsedEnv, 'AWSProfileRegion'),

      App: ensureString(unparsedEnv, 'App'),
      Version: ensureString(unparsedEnv, 'Version'),
      Environment: ensureString(unparsedEnv, 'Environment')
  };

  return buildConfig;
}



function Main() {

  let buildConfig: BuildConfig = getConfig();
  
  Tags.of(app).add('App', buildConfig.App);
  Tags.of(app).add('Environment', buildConfig.Environment);
  
  let s3AntivirusStackName = buildConfig.App + "-" + buildConfig.Environment + "-main";
  const mainStack = new S3AntivirusStack(app, s3AntivirusStackName, {
    env: {
        region: buildConfig.AWSProfileRegion,
        account: buildConfig.AWSAccountID
    }
  });

}
Main();