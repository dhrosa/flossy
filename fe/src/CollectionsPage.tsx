// Page for viewing basic information about all collections.

import { useRef, useState } from "react";
import { Collection } from "./Collection";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Modal } from "./Modal";
import { Symbol } from "./Symbol";
import { Control, ErrorHelp, Field, Label } from "./Form";

// Query key for list of all collections.
const queryKey = ["collections"];

// Render a Collection as a table row.
function CollectionRow({ collection }: { collection: Collection }) {
  const [deleteModalActive, setDeleteModalActive] = useState(false);
  const [renameModalActive, setRenameModalActive] = useState(false);
  const queryClient = useQueryClient();

  // Ref for the new name input element.
  const newNameRef = useRef(document.createElement("input"));

  // Triggered by rename button.
  const renameMutation = useMutation({
    mutationFn: async () => {
      await collection.rename(newNameRef.current.value);
      queryClient.invalidateQueries({ queryKey });
      setRenameModalActive(false);
    },
  });

  // Triggered by delete button.
  const deleteMutation = useMutation({
    mutationFn: async () => {
      await collection.delete();
      queryClient.invalidateQueries({ queryKey });
      setDeleteModalActive(false);
    },
  });

  return (
    <tr>
      <td>{collection.name}</td>
      <td>
        {/* Actions */}
        {/* Rename button */}
        <button className="button" onClick={() => setRenameModalActive(true)}>
          <span className="icon-text">
            <span className="icon">
              <Symbol name="edit" />
            </span>
            <span>Rename</span>
          </span>
        </button>
        {/* Delete button */}
        <button className="button" onClick={() => setDeleteModalActive(true)}>
          <span className="icon-text">
            <span className="icon">
              <Symbol name="delete" />
            </span>
            <span>Delete</span>
          </span>
        </button>
        {/* Rename button */}
        <Modal
          active={renameModalActive}
          onClose={() => setRenameModalActive(false)}
        >
          <div className="box">
            <Field>
              <Label>New Name</Label>
              <Control>
                <input
                  className="input"
                  type="text"
                  ref={newNameRef}
                  defaultValue={collection.name}
                />
              </Control>
            </Field>
            <Field className="is-grouped">
              <Control>
                <button
                  className={`button is-primary ${renameMutation.isPending && "is-loading"}`}
                  onClick={() => renameMutation.mutate()}
                >
                  Submit
                </button>
              </Control>
              <Control>
                <button
                  className="button"
                  onClick={() => setRenameModalActive(false)}
                >
                  Cancel
                </button>
              </Control>
              {renameMutation.isError && (
                <ErrorHelp>
                  {renameMutation.error.name == "ConstraintError"
                    ? "Collection with that name already exists."
                    : renameMutation.error.toString()}
                </ErrorHelp>
              )}
            </Field>
          </div>
        </Modal>
        {/* Deletion modal */}
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
                <ErrorHelp>{deleteMutation.error.message}</ErrorHelp>
              )}
            </p>
          </div>
        </Modal>
      </td>
    </tr>
  );
}

// Table row for creating a new collection.
function NewCollectionRow() {
  const queryClient = useQueryClient();
  const [newName, setNewName] = useState("");

  // Triggered by add button.
  const addMutation = useMutation({
    mutationFn: async () => {
      await Collection.create(newName);
      setNewName("");
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return (
    <tr>
      <td>
        <input
          className="input"
          type="text"
          placeholder="New collection name..."
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        {addMutation.error && (
          <ErrorHelp>
            {addMutation.error.name == "ConstraintError"
              ? "Collection with that name already exists."
              : addMutation.error.toString()}
          </ErrorHelp>
        )}
      </td>
      <td>
        <button
          className={`button ${addMutation.isPending && "is-loading"}`}
          onClick={() => addMutation.mutate()}
        >
          <span className="icon-text">
            <span className="icon">
              <Symbol name="add" />
            </span>
            <span>Create</span>
          </span>
        </button>
      </td>
    </tr>
  );
}

export function CollectionsPage() {
  const {
    isPending,
    error,
    data: collections,
  } = useQuery({
    queryKey,
    queryFn: Collection.all,
  });
  if (isPending) {
    return <p>Loading...</p>;
  }
  if (error) {
    return <p>Error: {error.toString()}</p>;
  }

  return (
    <>
      <table className="collections table">
        <thead>
          <tr>
            <th>Collection Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <NewCollectionRow />
          {collections.map((c) => (
            <CollectionRow key={c.name} collection={c} />
          ))}
        </tbody>
      </table>
    </>
  );
}
