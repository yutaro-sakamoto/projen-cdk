import { awscdk, SampleFile, YamlFile } from 'projen';

export interface AwsCdkTypeScriptAppOptions extends awscdk.AwsCdkTypeScriptAppOptions { }

export class AwsCdkTypeScriptApp extends awscdk.AwsCdkTypeScriptApp {
  constructor(options: AwsCdkTypeScriptAppOptions) {
    super(options);

    new SampleFile(this, '.github/copilot-instructions.md', {
      contents: `AWS CDKのコードがNode.jsのLambda関数を定義するとき、ランタイムのバージョンは22を指定すること。
たとえばlambda.Runtime.NODEJS_14_Xではなく、lambda.Runtime.NODEJS_22_Xを使うこと。

GitHub Actionsのワークフローファイルにおいて、useキーワードでactions/checkoutのような公式のアクションを指定するときは、かならず@v4のバージョンを指定すること。
つまり、actions/checkout@v2ではなくactions/checkout@v4を使うこと。

日本語の文章は、必ず「である調」を使い、「ですます調」は使わないこと。
例えば、「変数である」「実行せよ」という文は使って良いが、「変数です」「実行してください」という文は使わないこと。
`,
    });

    new SampleFile(this, '.github/PULL_REQUEST_TEMPLATE.md', {
      contents: `# 概要

Pull Requestの目的と概要を記載する

# 変更点

変更点や修正箇所を箇条書きで記載する

- 変更点1
- 変更点2
- 変更点3

# 影響範囲

影響範囲について記載すること

# テスト

この修正に対するテスト内容を記載すること

# 関連Issue

このPull Requestに関連するIssueを記載すること

# 関連Pull Request

このPull Requestに関連するPull Requestを記載すること

# その他

その他特筆すべき事項があれば記載する

`,
    });

    new YamlFile(this, '.github/workflows/check-workflows.yml', {
      obj: {
        name: 'Check workflow files',
        on: {
          workflow_call: {},
        },
        permissions: {
          contents: 'read',
        },
        jobs: {
          build: {
            'runs-on': 'ubuntu-latest',
            'steps': [
              {
                name: 'Checkout',
                uses: 'actions/checkout@v4',
              },
              {
                name: 'Install actionlint',
                run: 'GOBIN=$(pwd) go install github.com/rhysd/actionlint/cmd/actionlint@latest',
              },
              {
                name: 'Run actionlint',
                run: './actionlint',
              },
            ],
          },
        },
      },
    });

    new YamlFile(this, '.github/workflows/test.yml', {
      obj: {
        name: 'Run tests',
        on: {
          workflow_call: {},
        },
        permissions: {
          contents: 'read',
        },
        jobs: {
          test: {
            'runs-on': 'ubuntu-latest',
            'steps': [
              {
                uses: 'actions/checkout@v4',
              },
              {
                uses: 'actions/setup-node@v4',
                with: {
                  'node-version': '22',
                  'cache': 'npm',
                  'cache-dependency-path': 'package-lock.json',
                },
              },
              {
                run: 'npm ci',
              },
              {
                name: 'Check format by Prettier',
                run: 'npx prettier . --check',
              },
              {
                name: 'Check by ESLint',
                run: 'npx eslint .',
              },
              {
                name: 'Run tests',
                run: 'npm test',
              },
              {
                name: 'Check docs',
                run: 'npx typedoc --validation --treatWarningsAsErrors --treatValidationWarningsAsErrors lib/*.ts bin/*.ts',
              },
              {
                name: 'Synthesize the CDK stack',
                run: 'npx cdk synth',
              },
            ],
          },
        },
      },
    });

    new YamlFile(this, '.github/workflows/push.yml', {
      obj: {
        name: 'push',
        on: {
          push: {
            'branches-ignore': ['main'],
          },
        },
        concurrency: {
          'group': '${{ github.workflow }}-${{ github.ref }}',
          'cancel-in-progress': true,
        },
        permissions: {
          contents: 'read',
        },
        jobs: {
          'check-workflows': {
            permissions: {
              contents: 'read',
            },
            uses: './.github/workflows/check-workflows.yml',
          },
          'test': {
            needs: 'check-workflows',
            permissions: {
              contents: 'read',
            },
            secrets: 'inherit',
            uses: './.github/workflows/test.yml',
          },
        },
      },
    });

    new YamlFile(this, '.github/workflows/push.yml', {
      obj: {
        name: 'push',
        on: {
          push: {
            branches: ['main'],
          },
        },
        concurrency: {
          'group': '${{ github.workflow }}-${{ github.ref }}',
          'cancel-in-progress': true,
        },
        permissions: {
          'id-token': 'write',
          'contents': 'read',
        },
        jobs: {
          'check-workflows': {
            permissions: {
              contents: 'read',
            },
            uses: './.github/workflows/check-workflows.yml',
          },
          // 'deploy': {
          //   needs: 'check-workflows',
          //   if: "${{ !contains(github.event.head_commit.message, '[No Deploy]') && !contains(toJson(github.event.commits.*.author.name), 'dependabot') }}",
          //   permissions: {
          //     'id-token': 'write',
          //     contents: 'read',
          //   },
          //   secrets: 'inherit',
          //   uses: './.github/workflows/deploy.yml',
          // },
        },
      },
    });

    new YamlFile(this, '.github/workflows/pull-request.yml', {
      obj: {
        name: 'pull request',
        on: {
          pull_request: {
            types: ['opened', 'reopened', 'review_requested', 'synchronize'],
          },
        },
        concurrency: {
          'group': '${{ github.workflow }}-${{ github.ref }}',
          'cancel-in-progress': true,
        },
        permissions: {
          'id-token': 'write',
          'contents': 'read',
        },
        jobs: {
          'check-workflows': {
            permissions: {
              contents: 'read',
            },
            uses: './.github/workflows/check-workflows.yml',
          },
          'test': {
            needs: 'check-workflows',
            permissions: {
              contents: 'read',
            },
            secrets: 'inherit',
            uses: './.github/workflows/test.yml',
          },
          // 'cdk-diff-comment': {
          //   needs: 'check-workflows',
          //   if: "github.actor != 'dependabot[bot]'",
          //   permissions: {
          //     'id-token': 'write',
          //     contents: 'write',
          //     'pull-requests': 'write',
          //   },
          //   secrets: 'inherit',
          //   uses: './.github/workflows/post-cdk-diff.yml',
          // },
          // 'auto-merge-dependabot-pr': {
          //   needs: ['test'],
          //   if: "github.actor == 'dependabot[bot]'",
          //   'runs-on': 'ubuntu-latest',
          //   permissions: {
          //     contents: 'write',
          //     'pull-requests': 'write',
          //   },
          //   steps: [
          //     {
          //       uses: 'actions/checkout@v4',
          //     },
          //     {
          //       run: 'gh pr merge "${GITHUB_HEAD_REF}" --squash --auto',
          //       env: {
          //         GITHUB_TOKEN: '${{ secrets.GITHUB_TOKEN }}',
          //       },
          //     },
          //   ],
          // },
        },
      },
    });

    new YamlFile(this, '.github/workflows/post-cdk-diff.yml', {
      obj: {
        name: 'cdk diff',
        on: {
          workflow_call: {},
        },
        permissions: {
          'contents': 'read',
          'id-token': 'write',
          'pull-requests': 'write',
        },
        env: {
          ROLE_ARN: 'arn:aws:iam::${{ secrets.AWS_ID }}:role/${{ secrets.ROLE_NAME }}',
          SESSION_NAME: 'gh-oidc-${{ github.run_id }}-${{ github.run_attempt }}',
          AWS_REGION: 'ap-northeast-1',
        },
        jobs: {
          'cdk-diff': {
            'runs-on': 'ubuntu-latest',
            'steps': [
              {
                uses: 'aws-actions/configure-aws-credentials@v4',
                with: {
                  'role-to-assume': '${{ env.ROLE_ARN }}',
                  'role-session-name': '${{ env.SESSION_NAME }}',
                  'aws-region': '${{ env.AWS_REGION }}',
                },
              },
              {
                name: 'Checkout',
                uses: 'actions/checkout@v4',
              },
              {
                name: 'Run `cdk diff`',
                run: 'npm install && echo \'# cdk diffの結果\' > cdk-diff-result.txt && npx cdk diff >> cdk-diff-result.txt',
              },
              {
                name: 'Post a comment',
                uses: 'actions/github-script@v7.0.1',
                with: {
                  script: 'const fs = require(\'fs\'); const result = fs.readFileSync(\'cdk-diff-result.txt\', \'utf8\'); github.rest.issues.createComment({ issue_number: context.issue.number, owner: context.repo.owner, repo: context.repo.repo, body: result });',
                },
              },
            ],
          },
        },
      },
    });
  }
}