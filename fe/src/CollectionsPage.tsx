import { useRef } from "react";
import { Collection } from "./Collection";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

function CollectionList() {
  const queryClient = useQueryClient();
  const queryKey = ["collections"];
  const {
    isPending,
    error,
    data: collections,
  } = useQuery({
    queryKey,
    queryFn: Collection.all,
  });
  const inputRef = useRef<HTMLInputElement>(document.createElement("input"));

  const addMutation = useMutation({
    mutationFn: async () => {
      const collection = new Collection(inputRef.current.value);
      await collection.save();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  if (isPending) {
    return <p>Loading...</p>;
  }
  if (error) {
    return <p>Error: {error.toString()}</p>;
  }

  return (
    <>
      <ul>
        {collections.map((c) => (
          <li key={c.name}>{c.name}</li>
        ))}
      </ul>

      <input
        ref={inputRef}
        className="input"
        type="text"
        placeholder="New collection name..."
      />
      <button
        className={`button ${addMutation.isPending && "is-loading"}`}
        onClick={() => addMutation.mutate()}
      >
        Create new collection
      </button>
      {addMutation.error && (
        <p className="help is-danger">
          {addMutation.error.name == "ConstraintError"
            ? "Collection with that name already exists."
            : `Error while creating collection: ${addMutation.error.toString()}`}
        </p>
      )}
    </>
  );
}

export function CollectionsPage() {
  return <CollectionList />;
}
