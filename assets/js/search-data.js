// get the ninja-keys element
const ninja = document.querySelector('ninja-keys');

// add the home and posts menu items
ninja.data = [{
    id: "nav-home",
    title: "Home",
    section: "Navigation",
    handler: () => {
      window.location.href = "/";
    },
  },{id: "nav-agenda",
          title: "Agenda",
          description: "FIXME - Agenda - Description",
          section: "Navigation",
          handler: () => {
            window.location.href = "/events/";
          },
        },{id: "nav-projets",
          title: "Projets",
          description: "FIXME - Projects - Description",
          section: "Navigation",
          handler: () => {
            window.location.href = "/projects/index.html";
          },
        },{id: "nav-galerie",
          title: "Galerie",
          description: "FIXME - Galerie - Description",
          section: "Navigation",
          handler: () => {
            window.location.href = "/galerie/";
          },
        },{id: "nav-contact",
          title: "Contact",
          description: "FIXME - Contact - Description",
          section: "Navigation",
          handler: () => {
            window.location.href = "/contact/";
          },
        },{id: "biographies-dubroca-enguerrand",
          title: 'Dubroca_enguerrand',
          description: "",
          section: "Biographies",handler: () => {
              window.location.href = "/biographies/dubroca_enguerrand.html";
            },},{id: "biographies-osawa-yuko",
          title: 'Osawa_yuko',
          description: "",
          section: "Biographies",handler: () => {
              window.location.href = "/biographies/osawa_yuko.html";
            },},{id: "biographies-osawa-yuko-v2",
          title: 'Osawa_yuko_v2',
          description: "",
          section: "Biographies",handler: () => {
              window.location.href = "/biographies/osawa_yuko_v2.html";
            },},{id: "events-a-simple-inline-announcement-with-markdown-emoji-sparkles-smile",
          title: 'A simple inline announcement with Markdown emoji! :sparkles: :smile:',
          description: "",
          section: "Events",},{id: "events-a-simple-inline-announcement-with-markdown-emoji-sparkles-smile",
          title: 'A simple inline announcement with Markdown emoji! :sparkles: :smile:',
          description: "",
          section: "Events",},{id: "events-a-simple-inline-announcement-with-markdown-emoji-sparkles-smile",
          title: 'A simple inline announcement with Markdown emoji! :sparkles: :smile:',
          description: "",
          section: "Events",},{id: "events-a-simple-inline-announcement-with-markdown-emoji-sparkles-smile",
          title: 'A simple inline announcement with Markdown emoji! :sparkles: :smile:',
          description: "",
          section: "Events",},{id: "events-a-simple-inline-announcement-with-markdown-emoji-sparkles-smile",
          title: 'A simple inline announcement with Markdown emoji! :sparkles: :smile:',
          description: "",
          section: "Events",},{id: "events-a-long-announcement-with-details",
          title: 'A long announcement with details',
          description: "",
          section: "Events",handler: () => {
              window.location.href = "/event/2026/announcement_1/";
            },},{id: "events-a-long-announcement-with-details",
          title: 'A long announcement with details',
          description: "FIXME - Description",
          section: "Events",handler: () => {
              window.location.href = "/event/2027/announcement_2/";
            },},{id: "projects-project-1",
          title: 'project 1',
          description: "with background image",
          section: "Projects",handler: () => {
              window.location.href = "/projects/2024-03-02-2_project.html";
            },},{id: "projects-project-2",
          title: 'project 2',
          description: "a project with a background image and giscus comments",
          section: "Projects",handler: () => {
              window.location.href = "/projects/2_project.html";
            },},{id: "projects-project-3-with-very-long-name",
          title: 'project 3 with very long name',
          description: "a project that redirects to another website",
          section: "Projects",handler: () => {
              window.location.href = "/projects/3_project.html";
            },},{id: "projects-project-4",
          title: 'project 4',
          description: "another without an image",
          section: "Projects",handler: () => {
              window.location.href = "/projects/4_project.html";
            },},{id: "projects-project-5",
          title: 'project 5',
          description: "a project with a background image",
          section: "Projects",handler: () => {
              window.location.href = "/projects/5_project.html";
            },},{id: "projects-project-6",
          title: 'project 6',
          description: "a project with no image",
          section: "Projects",handler: () => {
              window.location.href = "/projects/6_project.html";
            },},{id: "projects-project-7",
          title: 'project 7',
          description: "with background image",
          section: "Projects",handler: () => {
              window.location.href = "/projects/7_project.html";
            },},{id: "projects-project-8",
          title: 'project 8',
          description: "an other project with a background image and giscus comments",
          section: "Projects",handler: () => {
              window.location.href = "/projects/8_project.html";
            },},{id: "projects-project-9",
          title: 'project 9',
          description: "another project with an image 🎉",
          section: "Projects",handler: () => {
              window.location.href = "/projects/9_project.html";
            },},];
