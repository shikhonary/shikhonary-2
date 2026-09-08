import { EditRightFormOfVerbView } from "../components/edit-right-form-of-verb-view"

interface EditRightFormOfVerbPageProps {
  id: string
}

export function EditRightFormOfVerbPage({ id }: EditRightFormOfVerbPageProps) {
  return <EditRightFormOfVerbView id={id} />
}
