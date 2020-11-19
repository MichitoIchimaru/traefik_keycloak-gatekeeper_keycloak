<template>
  <v-app dark>
    <v-main>
      <v-app-bar
        color="white accent-4"
        dark
        flat
        style="position:fixed; z-index:99999;"
      >
        <v-toolbar-title class="black--text">
          Traefik Gatekeeper Keycloak
        </v-toolbar-title>

        <v-spacer />
        <v-btn
          color="green"
          dark
          href="/oauth/logout"
        >
          LOGOUT
        </v-btn>
      </v-app-bar>
      <v-container fluid>
        <nuxt />
      </v-container>
    </v-main>
  </v-app>
</template>
