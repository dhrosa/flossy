// Page for viewing and editing one single collection

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Collection } from "../Collection";
import { SingleFloss } from "../Floss";
import { Control, Field, Label } from "../Form";
import { useState } from "react";
import { Symbol } from "../Symbol";

export const Route = createFileRoute("/collections_/$name")({
  component: CollectionPage,
});

function CollectionPage() {
  const { name } = Route.useParams();
  const queryKey = ["collections", name];
  const {
    isPending,
    error,
    data: collection,
  } = useQuery({
    queryKey,
    queryFn: async () => {
      return await Collection.get(name);
    },
  });
  if (isPending) {
    return <p>Loading...</p>;
  }
  if (error) {
    return <p>Error: {error.toString()}</p>;
  }

  return (
    <>
      <p className="title is-4 has-text-centered">
        Collection: <em>{collection.name}</em>
      </p>

      <div className="collection-page columns">
        <div className="column">
          <p className="title is-5">Flosses currently in collection</p>
          <FlossDeleter collection={collection} />
        </div>
        <div className="column box">
          <p className="title is-5">Add new flosses to collection</p>
          <FlossAdder collection={collection} />
        </div>
      </div>
    </>
  );
}

// Render a Bulma tag for a floss, with an addon button.
function FlossTagWithButton({
  floss,
  isPending,
  buttonSymbol,
  buttonAction,
}: {
  floss: SingleFloss;
  isPending: boolean;
  buttonSymbol: string;
  buttonAction: () => void;
}) {
  return (
    <div className="tags has-addons are-medium">
      <span className="tag" style={floss.cssStyle} title={floss.description}>
        {floss.name}
      </span>
      <button
        className={`button tag ${isPending ? "is-loading" : ""}`}
        onClick={buttonAction}
        disabled={isPending}
      >
        <span className="icon">
          <Symbol name={buttonSymbol} />
        </span>
      </button>
    </div>
  );
}

function FlossTagWithDelete({
  collection,
  floss,
}: {
  collection: Collection;
  floss: SingleFloss;
}) {
  const queryClient = useQueryClient();
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const newCollection = await collection
        .withFlosses(collection.flosses.filter((f) => f.name !== floss.name))
        .save();
      queryClient.setQueryData(["collections", collection.name], newCollection);
    },
  });
  return (
    <FlossTagWithButton
      floss={floss}
      buttonSymbol="delete"
      buttonAction={deleteMutation.mutate}
      isPending={deleteMutation.isPending}
    />
  );
}

function FlossTagWithAdd({
  collection,
  floss,
}: {
  collection: Collection;
  floss: SingleFloss;
}) {
  const queryClient = useQueryClient();
  const addMutation = useMutation({
    mutationFn: async () => {
      const newCollection = await collection
        .withFlosses(collection.flosses.concat(floss))
        .save();
      queryClient.setQueryData(["collections", collection.name], newCollection);
    },
  });

  return (
    <FlossTagWithButton
      floss={floss}
      buttonSymbol="add"
      buttonAction={addMutation.mutate}
      isPending={addMutation.isPending}
    />
  );
}

// Component for showing and deleting flosses from a collection.
function FlossDeleter({ collection }: { collection: Collection }) {
  return (
    <Field className="is-grouped is-grouped-multiline">
      {[...collection.flosses].map((f: SingleFloss) => (
        <Control key={f.name}>
          <FlossTagWithDelete collection={collection} floss={f} />
        </Control>
      ))}
    </Field>
  );
}

// Component for adding floss to a collection.
function FlossAdder({ collection }: { collection: Collection }) {
  const [filterText, setFilterText] = useState("");
  const flossNames = new Set(collection.flosses.map((f) => f.name));
  const choices = SingleFloss.all.filter(
    (f) => !flossNames.has(f.name) && f.matchesFilter(filterText),
  );
  return (
    <>
      <Field>
        <Label>Search</Label>
        <Control>
          <input
            className="input"
            type="text"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
        </Control>
      </Field>
      <Field className="is-grouped is-grouped-multiline">
        {choices.map((f) => (
          <Control key={f.name}>
            <FlossTagWithAdd collection={collection} floss={f} />
          </Control>
        ))}
      </Field>
    </>
  );
}
