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
  flossName,
}: {
  collection: Collection;
  flossName: string;
}) {
  const floss = SingleFloss.fromName(flossName);
  if (!floss) {
    return <span className="tag">?</span>;
  }
  const queryClient = useQueryClient();
  const deleteMutation = useMutation({
    mutationFn: async () => {
      console.log("delete?");
      await collection.removeFloss(flossName);
      queryClient.invalidateQueries({
        queryKey: ["collections", collection.name],
      });
      console.log("delete: ", flossName);
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
    mutationFn: async (flossName: string) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await collection.addFloss(flossName);
      queryClient.invalidateQueries({
        queryKey: ["collections", collection.name],
      });
      console.log("add: ", flossName);
    },
  });
  const [filterText, setFilterText] = useState("");
  const choices = SingleFloss.all().filter(
    (f) => !collection.flossNames.has(f.name) && f.matchesFilter(filterText),
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
              <button
                className="tag"
                onClick={() => addMutation.mutate(f.name)}
              >
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
        <p className="title is-5">Current flosses</p>
        <Field className="is-grouped is-grouped-multiline">
          {[...collection.flossNames].map((flossName: string) => (
            <Control key={flossName}>
              <FlossTag collection={collection} flossName={flossName} />
            </Control>
          ))}
        </Field>
      </div>
      <div className="block">
        <FlossAdder collection={collection} />
      </div>
    </>
  );
}
