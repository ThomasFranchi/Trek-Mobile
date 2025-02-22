import {
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
} from "react-native";
import ImagePickerComponent from "../components/ImagePickerComponent";
import { useEffect, useState, useContext } from "react";
import backServerAddress from "../config";
import * as SecureStore from "expo-secure-store";
// import { UserConnect } from "../App";
import UserConnect  from "../Context";

export default function Profil({ navigation }) {
  // Image for ImagePickerComponent passed as prop
  const [image, setImage] = useState(null);

  // Check if the Button "Modify Profil" is clicked
  const [isClicked, setIsClicked] = useState(false);

  // Pass context to check if user is logged or not
  const { userLog, disconnect } = useContext(UserConnect);

  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const [userDetail, setUserDetail] = useState({
    firstName: "",
    lastName: "",
    mail: "",
    password: "",
    profilePicture: "",
    slug: "",
  });

  console.log("userDetail", userDetail);

  // Load the first time
  useEffect(() => {
    getUserUnique();
  }, []);

  // If user is not logged force navigate to login page
  if (!userLog) {
    navigation.navigate("Login");
  }

  // get the "user" info from DB
  async function getUserUnique() {
    const token = await SecureStore.getItemAsync("token");
    const options = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "bearer " + token,
      },
    };
    const result = await fetch(
      `http://${backServerAddress}:3001/login/userinfos/`,
      options
    );
    let data = await result.json();
    console.log("data : -->", data);
    if (data !== null) {
      setUserDetail(data);
    }
  }

  // Update user detail const from Input
  function handleChange(label, value) {
    setUserDetail({ ...userDetail, [label]: value });
  }

  // Submit change to server and DB
  async function handleSubmit() {
    const token = await SecureStore.getItemAsync("token");

    if (
      userDetail.firstName === "" ||
      userDetail.lastName === "" ||
      // user.password === "" ||
      userDetail.mail === ""
    ) {
      setErrorMessage(`Un ou plusieurs champ(s) manquant(s)`);
    } else if (
      userDetail.firstName !== "" &&
      userDetail.lastName !== "" &&
      // user.password !== "" &&
      userDetail.mail
    ) {
      setErrorMessage(null);

      let formdata = new FormData();
      formdata.append("firstName", userDetail.firstName);
      formdata.append("lastName", userDetail.lastName);
      formdata.append("mail", userDetail.mail);
      if (userDetail.password) {
        formdata.append("password", userDetail.password);
      }
      if (image) {
        formdata.append("clientPicture", {
          name: "profile.jpeg",
          uri: image,
          type: "image/jpeg",
        });
      }
      let options = {
        method: "PUT",
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: "bearer " + token,
        },
        body: formdata,
      };

      try {
        const result = await fetch(
          `http://${backServerAddress}:3001/clients/update`,
          options
        );

        // Response from DB on /login routes
        const data = await result.json();

        // retreive token
        // const token = data.token;
        if (data.success) {
          setSuccessMessage(data.message);
          setErrorMessage(null)
        } else if (!data.success) {
          setErrorMessage(data.message);
          setSuccessMessage(null);
        }
      } catch (error) {
        console.error(error);
      }
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.containerScroll}>
      <TouchableOpacity style={styles.button} onPress={() => disconnect()}>
          <Text style={styles.textbutton}>Me déconnecter</Text>
        </TouchableOpacity>
      <View style={styles.container}>
        {userDetail?.clientPicture !== "" && (
          <Image
            style={styles.profilePicture}
            source={{ uri: `http://${backServerAddress}:3001${userDetail.clientPicture}`}}
          />
        )}

        <Text style={styles.content}>Nom : {userDetail?.firstname}</Text>
        <Text style={styles.content}>Prénom : {userDetail?.lastname}</Text>
        <Text style={styles.content}>Email : {userDetail?.email}</Text>



        <TouchableOpacity
          style={styles.button}
          onPress={() => setIsClicked(!isClicked)}
        >
          <Text style={styles.textbutton}>Modifier mes informations</Text>
        </TouchableOpacity>

        {isClicked === true && (
          <View>
            <Text style={styles.text}>Votre Prénom</Text>

            <TextInput
              style={styles.input}
              // onChangeText={onChangeNumber}
              value={userDetail.firstName}
              onChangeText={(value) => handleChange("firstName", value)}
              placeholder="Votre Nom"
              keyboardType="default"
            />
            <Text style={styles.text}>Votre Nom</Text>

            <TextInput
              style={styles.input}
              // onChangeText={onChangeNumber}
              value={userDetail.lastName}
              onChangeText={(value) => handleChange("lastName", value)}
              placeholder="Votre Nom"
              keyboardType="default"
            />

            <Text style={styles.text}>Votre Email</Text>
            <TextInput
              style={styles.input}
              value={userDetail.mail}
              onChangeText={(value) => handleChange("mail", value)}
              placeholder="Votre Nom"
              keyboardType="default"
            />

            <Text style={styles.text}>Votre Mot de passe</Text>
            <TextInput
              style={styles.input}
              onChangeText={(value) => handleChange("password", value)}
              placeholder="Entrer un nouveau de mot de passe si vous souhaiter le changer"
              keyboardType="default"
            />
            <ImagePickerComponent
              image={image}
              setImage={setImage}
              title="Modifier mon Image de profil"
            />
            <TouchableOpacity
              style={styles.button}
              onPress={() => handleSubmit()}
            >
              <Text style={styles.textbutton}>
                Enregistrer les modifications
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundColor: "white",
    margin: 20,
    borderRadius: 16,
  },
  containerScroll: {
    flexGrow: 1,
    backgroundColor: "#f1ebe3",
  },

  profilePicture: {
    width: 200,
    height: 200,
    marginVertical: 20,
  },
  input: {
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: "#fff",
    width: 300,
    height: 50,
    marginBottom: 20,
    padding: 10,
    fontSize: 16,
    alignSelf: "center"

  },
  button: {
    backgroundColor: "#a92e34",
    paddingVertical: 8,
    paddingHorizontal: 24,
    alignContent: "center",
    justifyContent: "center",
    borderRadius: 16,
    margin: 36,
  },
  text: {
    textAlign: "left",
    alignSelf: "flex-start",
    paddingBottom: 10,
  },
  textbutton: {
    color: "white",
    alignSelf: "center",
    fontSize: 16,
  },
  content : {
    fontSize: 18,
    alignSelf: "flex-start",
    paddingHorizontal: 18,
    paddingVertical: 2,

  }
});
