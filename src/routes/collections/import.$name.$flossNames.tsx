import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SingleFloss } from "../../Floss";
import { Control, ErrorHelp, Field, Label } from "../../Form";
import { PageTitle } from "../../PageTitle";
import { FlossButton } from "../../FlossButton";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Collection } from "../../Collection";
import { toast } from "react-toastify";

export const Route = createFileRoute("/collections/import/$name/$flossNames")({
  component: ImportPage,
});

function ImportPage() {
  const { name, flossNames } = Route.useParams();

  // Parse out floss names and render an error if any are invalid.
  const flosses: SingleFloss[] = [];
  for (const name of flossNames.split("+")) {
    try {
      flosses.push(SingleFloss.fromName(name));
    } catch {
      return (
        <ErrorHelp>
          Invalid floss name: <em>{name}</em>. Malformed URL?
        </ErrorHelp>
      );
    }
  }

  // Name to save collection locally as.
  const [newName, setNewName] = useState(name);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const addMutation = useMutation({
    mutationFn: async () => {
      await Collection.create(newName, flosses);
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      // Navigate to the newly created collection.
      navigate({ to: "/collections/edit/$name", params: { name: newName } });
      toast.info(
        <p>
          Imported collection <em>{name}</em> as <em>{newName}</em>
        </p>,
      );
    },
  });

  return (
    <div className="import-page container is-max-desktop">
      <PageTitle>
        Import of collection <em>{name}</em>
      </PageTitle>
      <div className="block">
        <Field>
          <Label>Save to my collections as</Label>
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
              className={`button is-success ${addMutation.isPending ? "is-loading" : ""}`}
              onClick={() => addMutation.mutate()}
            >
              Save
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
      <div className="box">
        <h2 className="title is-4">Flosses</h2>
        <div className="grid">
          {flosses.map((f) => (
            <div className="cell" key={f.name}>
              <FlossButton floss={f} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
