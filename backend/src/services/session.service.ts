import axios from "axios";
import { GitHubOauthToken, GoogleOauthToken } from "types/auth.interface";
import { GitHubUser, GoogleUser } from "types/user.interface";
import qs from "qs";

const {
  GOOGLE_OAUTH_URL,
  GOOGLE_USER_API_URL,
  GOOGLE_OAUTH_CLIENT_ID,
  GOOGLE_OAUTH_CLIENT_SECRET,
  GOOGLE_OAUTH_REDIRECT,

  GITHUB_OAUTH_URL,
  GITHUB_USER_API_URL,
  GITHUB_OAUTH_CLIENT_ID,
  GITHUB_OAUTH_CLIENT_SECRET,
} = process.env;

/** Google OAuth Service */

export const getGoogleOauthToken = async ({
  code,
}: {
  code: string;
}): Promise<GoogleOauthToken> => {
  const options = {
    client_id: GOOGLE_OAUTH_CLIENT_ID,
    client_secret: GOOGLE_OAUTH_CLIENT_SECRET,
    redirect_uri: GOOGLE_OAUTH_REDIRECT,
    grant_type: "authorization_code",
    code,
  };
  try {
    const { data } = await axios.post<GoogleOauthToken>(
      GOOGLE_OAUTH_URL as string,
      qs.stringify(options),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    return data;
  } catch (err: any) {
    console.log("Failed to fetch Google Oauth Tokens");
    throw new Error(err);
  }
};

export async function getGoogleUser({
  id_token,
  access_token,
}: {
  id_token: string;
  access_token: string;
}): Promise<GoogleUser> {
  try {
    const { data } = await axios.get<GoogleUser>(
      `${GOOGLE_USER_API_URL}?alt=json&access_token=${access_token}`,
      {
        headers: {
          Authorization: `Bearer ${id_token}`,
        },
      }
    );

    return data;
  } catch (err: any) {
    console.log(err);
    throw Error(err);
  }
}

/** Github OAuth Service */

export const getGithubOathToken = async ({
  code,
}: {
  code: string;
}): Promise<GitHubOauthToken> => {
  const options = {
    client_id: GITHUB_OAUTH_CLIENT_ID,
    client_secret: GITHUB_OAUTH_CLIENT_SECRET,
    code,
  };

  const queryString = qs.stringify(options);

  try {
    const { data } = await axios.post(`${GITHUB_OAUTH_URL}?${queryString}`, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    const decoded = qs.parse(data) as GitHubOauthToken;

    return decoded;
  } catch (err: any) {
    throw Error(err);
  }
};

export const getGithubUser = async ({
  access_token,
}: {
  access_token: string;
}): Promise<GitHubUser> => {
  try {
    const { data } = await axios.get<GitHubUser>(
      GITHUB_USER_API_URL as string,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    return data;
  } catch (err: any) {
    throw Error(err);
  }
};
