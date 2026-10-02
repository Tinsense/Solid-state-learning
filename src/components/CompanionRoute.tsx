import { CompanionChapterPage } from "./CompanionChapterPage";
import { companionChapters } from "../content/companionChapters";
export default function CompanionRoute({ chapter }: { chapter:number }) {
 return <CompanionChapterPage key={chapter} chapter={companionChapters[chapter]}/>;
}
