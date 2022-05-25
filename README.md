# Frontend for Tap for Key

This is a React-enabled frontend of Tap for Key project.

### Capabilities
- Provides UI for key service (retrieval & returning of keys), management of user & roles, keys & key groups.
- Each user is assigned a unique card number (staff ID card) and username (usually CORP ID) for identification
- Each key is assigned a unique tag number (RFID tag)
- Users are assigned with multiple user groups, e.g. a user can be both a Senior Pharmacist is of user group Pharmacist and Pharmacist Manager
- Keys are grouped under `keyGroup`'s, the access rights of which are assigned to user groups (not individual users)

### Usage
- Debugging: `yarn dev`
- Build: `yarn build` after which the `build` folder is put into root folder of `backend` to serve this frontend
