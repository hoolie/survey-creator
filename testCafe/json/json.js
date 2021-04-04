import { getFrameworks, url, initCreator } from "../helper";
import { Selector } from "testcafe";
const title = "JSON tab";

const json = {
    questions: [
        {
            type: "text",
            name: "json_tab_text",
            title: "Change me"
        }
    ]
};

getFrameworks(process.argv).forEach((framework) => {
    fixture`${framework} ${title}`.page`${url}${framework}.html`.beforeEach(
        async (t) => {
            await initCreator(framework, json);
            await t.maximizeWindow();
        }
    );

    test("Change title of text question", async (t) => {
        await t.click(Selector(".svc-tabbed-menu-item").withText("JSON Editor"));
        await t.selectTextAreaContent(Selector(".svc-json-editor-tab__content-area"),
            8, 15, 8, 24).pressKey("backspace").pressKey("I space a m space c h a n g e d");
        await t.click(Selector(".svc-tabbed-menu-item").withText("Survey Designer"));
        await t.expect(Selector("h5").withText("I am changed").exists).ok();
    });
});