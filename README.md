# Catalog

List of all dataesr projects.


## Dev

Create a `.env` file in the `server` directory and set "VITE_GIT_PAT=HERE_IS_YOUR_GITHUB_PAT".

```sh
npm i && npm start
```


## Private metadata

To add your private metadata, create a file `my_metadata.json` in `/client/src/data`.
Set your env var `VITE_PRIVATE_METADATA='../data/my_metadata.json'` in your `.env.local` file in the `client` directory.
