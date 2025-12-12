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

function FlossTag({
  collection,
  floss,
}: {
  collection: Collection;
  floss: SingleFloss;
}) {
  const queryClient = useQueryClient();
  const deleteMutation = useMutation({
    mutationFn: async () => {
      collection.flosses = collection.flosses.filter(
        (f) => f.name !== floss.name,
      );
      await collection.save();
      queryClient.invalidateQueries({
        queryKey: ["collections", collection.name],
      });
    },
  });
  return (
    <div className="tags has-addons are-large">
      <span className="tag" style={floss.cssStyle}>
        {floss.name}
      </span>
      <button
        className="tag is-delete"
        onClick={() => deleteMutation.mutate()}
      />
    </div>
  );
}

function FlossAdder({ collection }: { collection: Collection }) {
  const queryClient = useQueryClient();
  const addMutation = useMutation({
    mutationFn: async (floss: SingleFloss) => {
      collection.flosses.push(floss);
      await collection.save();
      queryClient.invalidateQueries({
        queryKey: ["collections", collection.name],
      });
    },
  });
  const [filterText, setFilterText] = useState("");
  const flossNames = new Set(collection.flosses.map((f) => f.name));
  const choices = SingleFloss.all().filter(
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
            <div className="tags has-addons are-large">
              <span className="tag" style={f.cssStyle}>
                {f.name}
              </span>
              <button className="tag" onClick={() => addMutation.mutate(f)}>
                <Symbol name="add" />
              </button>
            </div>
          </Control>
        ))}
      </Field>
    </>
  );
}

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
      <p className="title is-4">
        Collection: <em>{collection.name}</em>
      </p>
      <div className="block">
        <p className="title is-5">Flosses in collection</p>
        <Field className="is-grouped is-grouped-multiline">
          {[...collection.flosses].map((f: SingleFloss) => (
            <Control key={f.name}>
              <FlossTag collection={collection} floss={f} />
            </Control>
          ))}
        </Field>
      </div>
      <div className="box block">
        <p className="title is-5">Add new flosses to collection</p>
        <FlossAdder collection={collection} />
      </div>
    </>
  );
}
