# TODO

## Users

### Contributions

- [ ] Group repository commits by day (but also support overall totals for period)
- [x] Support clicking on day to see commits/activity on day
- [ ] Show commits

### Followers, starred repositories, ...

```gql
query {
  user(login: "techniq") {
    login

    followers {
      totalCount
    }

    following {
      totalCount
    }

    starredRepositories {
      totalCount
    }
  }
}
```

## Repositories

### Stargazers

```gql
query {
  repository(owner: "sveltejs", name: "svelte") {
    stargazers(last: 10) {
      totalCount
      nodes {
        login
      }
    }
  }
}
```
