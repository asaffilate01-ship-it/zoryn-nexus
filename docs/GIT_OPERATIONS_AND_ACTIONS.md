# Git operations and GitHub Actions

Yes, pushing and watching the jobs involves both Git and GitHub Actions.

## Local Git operations

```bash
git checkout -b stage-9-provider-entry
git add .
git commit -m "Add Stage 9 final provider integration readiness"
git push -u origin stage-9-provider-entry
```

Then open a pull request into `main`.

## GitHub Actions operations

Open:

`Repository → Actions → Final provider-entry gates`

The workflow can be run manually in `mock` mode before any provider secrets are
configured. After Swan and Adyen sandbox secrets are stored in GitHub Actions,
run it in `sandbox` mode.

Required green jobs:

- Application
- Provider Contracts
- Browser
- Database
- Release Gate

## Main-branch protection

Require these checks before merge:

- Final provider-entry gates / Application
- Final provider-entry gates / Provider Contracts
- Final provider-entry gates / Browser
- Final provider-entry gates / Database
- Final provider-entry gates / Release Gate
