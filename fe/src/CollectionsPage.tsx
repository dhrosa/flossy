import { useRef, useState } from "react";
import { Collection } from "./Collection";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Modal } from "./Modal";

function CollectionListItem({ collection }: { collection: Collection }) {
  const [deleteModalActive, setDeleteModalActive] = useState(false);
  const queryClient = useQueryClient();
  const deleteMutation = useMutation({
    mutationFn: async () => {
      await collection.delete();
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      setDeleteModalActive(false);
    },
  });

  return (
    <li>
      {collection.name}
      <button className="delete" onClick={() => setDeleteModalActive(true)} />
      <Modal
        active={deleteModalActive}
        onClose={() => setDeleteModalActive(false)}
      >
        <div className="box">
          <p className="block">
            Are you sure you want to delete the <em>{collection.name}</em>{" "}
            collection?
          </p>
          <p className="buttons block">
            <button
              className={`button is-danger ${deleteMutation.isPending && "is-loading"}`}
              onClick={() => deleteMutation.mutate()}
            >
              Delete
            </button>
            <button
              className="button"
              onClick={() => setDeleteModalActive(false)}
            >
              Cancel
            </button>
            {deleteMutation.isError && (
              <p className="help is-danger">
                Error: {deleteMutation.error.message}
              </p>
            )}
          </p>
        </div>
      </Modal>
    </li>
  );
}

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
          <CollectionListItem key={c.name} collection={c} />
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
