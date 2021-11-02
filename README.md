# Single-cell Multilayer Viewer
## V1.0

scMLV is a visualization software for multimodal single-cell data.
This tool allows user to visualize up to 5 layers of information, with a maximum of 5 quantitative and 2 qualitative data.

This tool is powered by [Plotly.js]

![presentation](https://github.com/MarionPerrier/scMLV/blob/master/images/image.png?raw=true)

## Features

- Graphics can be exported in PNG or SVG format
- Legend can be exported in TXT format
- Size and color of each quantitative layer can be customized
- Size, shape, and color of each qualitative layer can be customized
- Your datasheet can be randomly resampled if you have too many cells
- Save and load the parameters used for the same dataset
- Offline usage. Internet connexion not needed
- No installation required

## Installation

scMLV does not require an installation.

1) Unzip scMLV_master.zip
2) Double click on "index.html" (a new tab in your default browser should appears)
3) Enjoy !

If you need more information about how to use this software, you can read the manual, included with the software after download.
A regular computer can be used for this software. There is no special requirements. However, please use **Firefox** or **Google Chrome** only. 

**This software is not supported on Internet Explorer or Edge. This software appears to be compatible with Safari, however keep in mind that it has not been developped for it. Other browsers has not been tested.**

## Images of the software
![software](https://github.com/MarionPerrier/scMLV/blob/master/images/screenshot.png?raw=true)

## Libraries

This is the libraries used by scMLV:

- [Plotly.js](https://plotly.com/javascript/) (v1.57.4) - A javascript data visualizion library
- [Bulma](https://bulma.io/) (v0.9.0) - A CSS framework
- [Pretty-checkbox](https://lokesh-coder.github.io/pretty-checkbox/) (v3.0.3) - Beautify checkboxes
- [Papaparse](https://www.papaparse.com/) (v5.2) - CSV parser in Javascript
- [Combinatorics](https://github.com/dankogai/js-combinatorics) (v0.25) - Javascript lobrary : Compute every kind of elements combination
- [Fontawesome](https://fontawesome.com/) (v5.3.1) - Provides the icons use by Bulma.

## Bugs
This software is still in developpement. As such, you can encounter several bugs and non wanted behavior. Please report them directly on Github, in the "issue" category. We will do our possible to reply and provide a solution rapidly.
Thank you for helping us !

## Citation
If you consider publishing graphics realised with scMLV, please cite : Juan-Pablo Cerapio, Marion Perrier, Camille-Charlotte Balança, Pauline Gravelle, Fréderic Pont, Christel Devaud, Don-Marc Franchini, Virginie Féliu, Marie Tosolini, Carine Valle, Fréderic Lopez, Anne Quillet-Mary, Loic Ysebaert, Alejandra Martinez, Jean Pierre Delord, Maha Ayyoub, Camille Laurent & Jean-Jacques Fournie (2021) Phased differentiation of γδ T and T CD8 tumor-infiltrating lymphocytes revealed by single-cell transcriptomics of human cancers, OncoImmunology, 10:1, DOI: 10.1080/2162402X.2021.1939518

## License

AGPL-3.0

[//]: # (These are reference links used in the body of this note and get stripped out when the markdown processor does its job. There is no need to format nicely because it shouldn't be seen. Thanks SO - http://stackoverflow.com/questions/4823468/store-comments-in-markdown-syntax)

   [Plotly.js]: <https://plotly.com/javascript/>
