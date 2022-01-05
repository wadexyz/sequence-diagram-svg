import { writable } from 'svelte/store';

const DiagramDataStore = writable({
    "actors": [
      {
        "id": "906",
        "label": "Emily"
      },
      {
        "id": "d32",
        "label": "User Agent"
      },
      {
        "id": "c6f",
        "label": "Client"
      },
      {
        "id": "ea4",
        "label": "Authorization Server"
      }
    ],
    "messages":
    [
        {
            "type" : "invocation",
            "source" : "c6f",
            "target" : "d32",
            "line-style" : "solid",
            "arrow-style" : "open",
            "label" : "initiate authorization"
        },
        {
            "type" : "invocation",
            "source" : "d32",
            "target" : "906",
            "line-style" : "dashed",
            "arrow-style" : "open",
            "label" : "prompt user"
        },
        {
            "type" : "return",
            "source" : "906",
            "target" : "d32",
            "line-style" : "solid",
            "arrow-style" : "open",
            "label" : "submit credentials"
        },
        {
            "type" : "invocation",
            "source" : "d32",
            "target" : "ea4",
            "line-style" : "solid",
            "arrow-style" : "open",
            "label" : "submit credentials (client_id, redirect_uri)"
        },
        {
            "type" : "return",
            "source" : "ea4",
            "target" : "d32",
            "line-style" : "dashed",
            "arrow-style" : "open",
            "label" : "return authorization code"
        },
        {
          "type" : "return",
          "source" : "d32",
          "target" : "c6f",
          "line-style" : "dashed",
          "arrow-style" : "open",
          "label" : "redirect authorization code"
      }
  ]
});

export default DiagramDataStore;
