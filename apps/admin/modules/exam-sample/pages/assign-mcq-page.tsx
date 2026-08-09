import { AssignMcqView } from "../components/assign-mcq-view"

interface AssignMcqPageProps {
  examId: string
}

export function AssignMcqPage({ examId }: AssignMcqPageProps) {
  return <AssignMcqView examId={examId} />
}
