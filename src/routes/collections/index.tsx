// Page for viewing basic information about all collections.

import { useState } from "react";
import { Collection } from "../../Collection";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Modal, useModalState } from "../../Modal";
import { Symbol } from "../../Symbol";
import { Control, ErrorHelp, Field, Label } from "../../Form";
import {
  createFileRoute,
  Link,
  useNavigate,
  useRouter,
} from "@tanstack/react-router";
import { SingleFloss } from "../../Floss";
import { PageTitle } from "../../PageTitle";
import { toast } from "react-toastify";

export const Route = createFileRoute("/collections/")({
  component: CollectionsPage,
});

// Query key for list of all collections.
const queryKey = ["collections"];

function FlossPreview({ flosses }: { flosses: SingleFloss[] }) {
  const gradientArgs = flosses.map(({ color }) => color.display());
  return (
    <div
      className="floss-preview"
      style={{
        background: `linear-gradient(to bottom right, ${gradientArgs.join(", ")})`,
      }}
    ></div>
  );
}

function RenameButton({ collection }: { collection: Collection }) {
  const { modalIsOpen, openModal, closeModal } = useModalState();
  const queryClient = useQueryClient();
  const [newName, setNewName] = useState(collection.name);

  // Triggered by rename button.
  const renameMutation = useMutation({
    mutationFn: async () => {
      await collection.rename(newName);
      queryClient.invalidateQueries({ queryKey });
      closeModal();
      toast.info(
        <p>
          Renamed collection from <em>{collection.name}</em> to{" "}
          <em>{newName}</em>.
        </p>,
      );
    },
  });

  return (
    <>
      <a className="card-footer-item" onClick={openModal}>
        <span className="icon-text">
          <span className="icon">
            <Symbol name="edit" />
          </span>
          <span>Rename</span>
        </span>
      </a>
      <Modal isOpen={modalIsOpen} onClose={closeModal}>
        <div className="box">
          <Field>
            <Label>New Name</Label>
            <Control>
              <input
                className="input"
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
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
              <button className="button" onClick={closeModal}>
                Cancel
              </button>
            </Control>
          </Field>
          {renameMutation.isError && (
            <ErrorHelp>
              {renameMutation.error.name == "ConstraintError"
                ? "Collection with that name already exists."
                : renameMutation.error.toString()}
            </ErrorHelp>
          )}
        </div>
      </Modal>
    </>
  );
}

function DeleteButton({ collection }: { collection: Collection }) {
  const { modalIsOpen, openModal, closeModal } = useModalState();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await collection.delete();
      queryClient.invalidateQueries({ queryKey });
      closeModal();
      toast.info(
        <p>
          Deleted collection: <em>{collection.name}</em>
        </p>,
      );
    },
  });

  return (
    <>
      <a className="card-footer-item" onClick={openModal}>
        <span className="icon-text">
          <span className="icon">
            <Symbol name="delete" />
          </span>
          <span>Delete</span>
        </span>
      </a>
      <Modal isOpen={modalIsOpen} onClose={closeModal}>
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
            <button className="button" onClick={closeModal}>
              Cancel
            </button>
            {deleteMutation.isError && (
              <ErrorHelp>{deleteMutation.error.message}</ErrorHelp>
            )}
          </p>
        </div>
      </Modal>
    </>
  );
}

function ShareButton({ collection }: { collection: Collection }) {
  const { name } = collection;
  const router = useRouter();
  const importLinkOptions = {
    to: "/collections/import/$name/$flossNames",
    params: {
      name,
      flossNames: collection.flosses.map(({ name }) => name).join("+"),
    },
  };
  const absoluteImportUrl = new URL(
    router.buildLocation(importLinkOptions).href,
    window.location.origin,
  ).href;

  const copyImportUrl = async () => {
    try {
      await navigator.clipboard.writeText(absoluteImportUrl);
      toast.info("URL copied to clipboard");
    } catch (error: unknown) {
      toast.error(`Failed to copy URL to clipboard: ${new String(error)}`);
    }
  };
  return (
    <a className="card-footer-item" onClick={copyImportUrl}>
      <span className="icon-text">
        <span className="icon">
          <Symbol name="content_copy" />
        </span>
        <span>Share URL</span>
      </span>
    </a>
  );
}

function CollectionCard({ collection }: { collection: Collection }) {
  return (
    <div className="card">
      <div className="card-image">
        <figure className="image">
          <Link to="/collections/edit/$name" params={{ name: collection.name }}>
            <FlossPreview flosses={collection.flosses} />
          </Link>
        </figure>
      </div>
      <div className="card-header">
        <div className="card-header-title">{collection.name}</div>
      </div>

      <div className="card-footer">
        <Link
          className="card-footer-item"
          to="/collections/edit/$name"
          params={{ name: collection.name }}
        >
          View
        </Link>
        <RenameButton collection={collection} />
        <DeleteButton collection={collection} />
        <ShareButton collection={collection} />
      </div>
    </div>
  );
}

function NewCollectionButton() {
  const queryClient = useQueryClient();
  const [newName, setNewName] = useState("");
  const { modalIsOpen, openModal, closeModal } = useModalState();
  const navigate = useNavigate();

  // Triggered by add button.
  const addMutation = useMutation({
    mutationFn: async () => {
      await Collection.create(newName);
      queryClient.invalidateQueries({ queryKey });

      navigate({
        to: "/collections/edit/$name",
        params: { name: newName },
      });
      toast.info(
        <p>
          Created collection: <em>{newName}</em>
        </p>,
      );
    },
  });

  return (
    <>
      <button className="block button is-success" onClick={openModal}>
        <span className="icon is-small">
          <Symbol name="add" />
        </span>
        <span>Create New Collection</span>
      </button>
      <Modal isOpen={modalIsOpen} onClose={closeModal}>
        <div className="box">
          <Field>
            <Label>New Collection Name</Label>
            <Control>
              <input
                className="input"
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </Control>
          </Field>
          <Field>
            <Control>
              <button
                className={`button is-success ${addMutation.isPending && "is-loading"}`}
                onClick={() => addMutation.mutate()}
              >
                Submit
              </button>
            </Control>
          </Field>
          {addMutation.error && (
            <ErrorHelp>
              {addMutation.error.name == "ConstraintError"
                ? "Collection with that name already exists."
                : addMutation.error.toString()}
            </ErrorHelp>
          )}
        </div>
      </Modal>
    </>
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
    <div className="collections-page">
      <PageTitle>My Collections</PageTitle>
      <p className="block">
        Your saved floss collections. Your floss collections are stored locally
        on your device. If you want transfer a collection to another device, or
        share them with another person, use the <strong>Share URL</strong>{" "}
        button on a collection.
      </p>
      <NewCollectionButton />
      <div className="block collections ">
        {collections &&
          collections.map((c) => (
            <CollectionCard key={c.name} collection={c} />
          ))}
      </div>
    </div>
  );
}
