# Introduction

The application uses planetscale as its db and Prisma as the ORM. You'll need to create a PlanetScale account and a new db to work locally. You'll also need the PlanetScale CLI.

## Login to planet Scale

    pscale auth login

## Connect to your database via the CLI

This step creates local proxy to PlanetScale. Then Prisma can use this URL in the env to connect :)

    pscale connect <db-name> main

## Generate the prisma client

    npx prisma Generate

## Push the schema to your db

You can first use a different branch on PlanetScale and later merge it to main if you prefer that, need to connect to the other branch first. (PlanetScale schema changes are amazing)

    npx prisma db push

## Seeding your db with users

    npx prisma db seed