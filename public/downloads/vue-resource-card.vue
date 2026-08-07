<script setup lang="ts">defineProps<{title:string;description:string;tag?:string}>()</script>
<template><article class="resource-card"><small>{{tag}}</small><h3>{{title}}</h3><p>{{description}}</p><slot/></article></template>
<style scoped>.resource-card{border:1px solid #e7e7e7;border-radius:20px;padding:24px;background:white}.resource-card h3{margin:8px 0}.resource-card p{color:#666}</style>
