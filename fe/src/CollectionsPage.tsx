import { useRef } from "react";
import { Collection } from "./Collection";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

function CollectionList() {
  const queryClient = useQueryClient();
  const queryKey = ["collections"];
  const { isPending, error, data } = useQuery({
    queryKey,
    queryFn: Collection.all,
  });
  const inputRef = useRef<HTMLInputElement>(document.createElement("input"));

  const mutation = useMutation({
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
        {data.map((c) => (
          <li key={c.name}>{c.name}</li>
        ))}
      </ul>

      <input
        ref={inputRef}
        className="input"
        type="text"
        placeholder="New collection name..."
      />
      <button className="button" onClick={() => mutation.mutate()}>
        Create new collection
      </button>
    </>
  );
}

export function CollectionsPage() {
  return <CollectionList />;
}
