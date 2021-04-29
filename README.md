# Multicorder

[![multicorder](https://snyk.io/advisor/npm-package/multicorder/badge.svg)](https://snyk.io/advisor/npm-package/multicorder)  

* Record video from cameras
* Record video from desktop screens
* Playback recordings
* Take snapshots of video
* Download videos or snapshots

## Demo App

View the Multicorder on [Netlify](https://eloquent-kowalevski-0dbda6.netlify.app/).
Expect new versions weekly for a while.

## Why Multicorder?

1. Lightweight

All of the core logic is in a single Vue 2 component with no depenendcies outside of Vue. All the functionality can harnessed in any Vue 2 or Vue 3 app.

2. Batteries included!

A full featured Vuetify UI is included. If you are alredy using Vuetify you can record and download video and snapshots out of the box, no coding needed.

3. Full AWS Amplify integration (coming soon!)

This was designed from the outset to work well with AWS Amplify and S3 Storage. We'll publish a number of sample apps that showcase the functionality.

## Demo Site

You can see the app [deployed on Netlify](https://eloquent-kowalevski-0dbda6.netlify.app/).


## Installing

```bash
npm install multicorder
```

## Using the Multicorder core module

100% of the core functionality can be imported into any [Vue](https://vuejs.org/) 2 or Vue 3 app with no extra dependencies.

The [AWS Amplify](https://aws.amazon.com/amplify/) functionality will be in a separate component.

### Import the component in your `<script>`

```javascript
import { Multicorder } from 'multicorder';
```

## Using the Vuetify UI

To get up and running quickly a full UI is provided built on the wonderful [Vuetify](https://vuetifyjs.com/) framework.

### Import the Vue file from source

```javascript
import  MulticorderUI  from 'multicorder/vuetify_ui/src/components/MulticorderUI.vue';
```

### Export the component

```javascript
  export default {
    components: {
      MulticorderUI
    },
```

### Use in the template

```html
<MulticorderUI />
```

#### Define video options

You can limit the options to just cameras or just sreensharing if that is more appropriate for your needs.

Just define the videoTypes prop on the component as an array with he options(s) you want to support.

```html
<MulticorderUI 
  :videoTypes="['screen', 'camera']"
/>
```

or if you just want cameras offered:

```html
<MulticorderUI 
  :videoTypes="['camera']"
/>
```

The only options are `screen` and `camera`.
