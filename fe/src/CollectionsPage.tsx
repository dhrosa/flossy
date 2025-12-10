import { Suspense, use, useRef } from "react";
import { Collection } from "./Collection";
import { ErrorBoundary } from "react-error-boundary";
import { useNavigate } from "react-router";

function CollectionList({
  collectionsPromise,
}: {
  collectionsPromise: Promise<Collection[]>;
}) {
  const collections = use(collectionsPromise);
  const inputRef = useRef<HTMLInputElement>(document.createElement("input"));
  const navigate = useNavigate();
  const newCollection = async () => {
    const collection = new Collection(inputRef.current.value);
    await collection.save();
    console.log("collection saved");
    await navigate(0);
  };
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
      <button className="button" onClick={newCollection}>
        Create new collection
      </button>
    </>
  );
}

export function CollectionsPage() {
  return (
    <>
      <ErrorBoundary fallback={<div>An error occurred.</div>}>
        <Suspense fallback={<div>Loading...</div>}>
          <CollectionList collectionsPromise={Collection.all()} />
        </Suspense>
      </ErrorBoundary>
    </>
  );
}
