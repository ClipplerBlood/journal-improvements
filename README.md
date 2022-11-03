<p align="center">
<img src="https://raw.githubusercontent.com/ClipplerBlood/journal-improvements/master/.github/img/journal-improvements-logo.png" align="center">
</p>


Foundry introduced a new journal interface and editor in V10. It improved the organization of text and image pages into singular journals and introduced fast and collaborative editor. This module introduces quality of life improvements and new functionality to the new Foundry Journals that build upon the new architecture and introduces new features.

<p align="center"><a href="https://ko-fi.com/L4L0FGLLH"><img src="https://ko-fi.com/img/githubbutton_sm.svg" /></a></p>

## Features
All functionalities marked with [Setting] can be turned on and off in the module settings.

### New Functionality
- [Setting] You can now open the **editor right into the Journal** interface without opening a separate page dialog
- You can now use **Markdown** in the editor ([what is Markdown](https://www.markdownguide.org/getting-started/)?)
- [Setting] You can change the integrated editor engine from ProseMirror to TinyMCE (Foundry VTT editor of version V9 and before) or use simple Makrdown
- You can use **CTRL+V** to paste images and formatted text from the clipboard right into the Journal without creating a separate page first and even without using the editor. You can use SHIFT+CTRL+V to paste text in plain format, ignoring its formatting. Images are uploaded in a directory set in the Settings, and you can choose whether to use the Foundry VTT new image pages or paste images into text pages where you can mix images with text.
- [Setting] If using the integrated editor, you can enable **auto-saving**. When the sheet is closed or the cursor leaves the editor, the page contents are automatically saved.


### New Interface Improvements
- The index of pages in the left sidebar now properly starts from 1 instead of 0
- [Setting] When creating a new journal, it can start with already available text page for you to start writing. The name of the page is inherited by the journal, but can be changed later.
- [Setting] The **Add Page button** that opens a dialogue asking for name and type of page is now simplified to a list of buttons with content icons. This simplifies creating a new page of specific type of content to one click instead of four.
- [Setting] If using the new Add Page buttons, you can remove the content types you never use making the selection of buttons smaller.
- [Setting] If using the new Add Page buttons, you can fully skip the dialog asking for name of the page. New pages can be created with a default name that can be edited later.


## License
This project is being developed under the terms of the
[LIMITED LICENSE AGREEMENT FOR MODULE DEVELOPMENT](https://foundryvtt.com/article/license) for Foundry Virtual Tabletop and the [MIT](https://raw.githubusercontent.com/ClipplerBlood/journal-improvements/master/LICENSE) license.

## Acknowledgement and support
Huge thanks to ApoApostolov#4622 for the original idea and for supporting the development!

If you find this module useful consider buying a coffee to support its development :D

