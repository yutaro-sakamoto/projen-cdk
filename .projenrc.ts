import { cdk } from 'projen';
const project = new cdk.JsiiProject({
  author: 'Yutaro Sakamoto',
  authorAddress: 'yutaro-sakamoto@yutaro-sakamoto.com',
  defaultReleaseBranch: 'main',
  jsiiVersion: '~5.7.0',
  name: 'projen-cdk',
  projenrcTs: true,
  repositoryUrl: 'https://github.com/yutaro-sakamoto/projen-cdk.git',

  // deps: [],                /* Runtime dependencies of this module. */
  // description: undefined,  /* The description is just a string that helps people understand the purpose of the package. */
  // devDeps: [],             /* Build dependencies for this module. */
  // packageName: undefined,  /* The "name" in package.json. */
});
project.synth();