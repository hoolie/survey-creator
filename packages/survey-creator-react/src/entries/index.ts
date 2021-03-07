export let Version: string;
Version = `${process.env.VERSION}`;

import "@survey/creator/survey-creator-core.css";
export * from "../SurveyCreator";
export * from "../components/tabs/Designer";
export * from "../components/tabs/JsonEditorAce";
export * from "../components/tabs/JsonEditorTextarea";
export * from "../components/tabs/Preview";
export * from "../components/tabs/Logic";
export * from "../components/toolbox/Toolbox";
