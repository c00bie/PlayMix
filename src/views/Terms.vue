<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter()
</script>

<template>
  <n-space align="center" vertical>
    <div id="terms">
      <n-button @click="router.push('/')" text>&lt; Return</n-button>
      <h1>Terms and conditions</h1>
      <h2>TL;DR</h2>
      <ul>
        <li>SpotiShuffle is a web app that allows you to mix and shuffle your Spotify playlists together. </li>
        <li>We do not gather any of your personal information, but Spotify might.</li>
        <li>Spotify Premium subscription is required.</li>
      </ul>
      <hr />
      <p>SpotiShuffle (referred to as “SpotiShuffle”, “App”, “Service”) is a web app that allows users to mix their Spotify playlists, developed by Jakub Kańduła (referred to as "Creator", "We", "Us", "Our") and available at https://spotishuffle.coobie.dev. By using the app, you agree to the following terms of service:</p>
      <ol>
        <li>You must be at least 13 years old to use the App, or as stated by your local law.</li>
        <li>You are responsible for any and all activity that occurs under your Spotify account. This includes, but is not limited to, playlist creation, playlist selection, mixing and playback.</li>
        <li>You will not use the App for any illegal or unauthorized purpose. This includes, but is not limited to, copyrighted material, trademark infringement, or hacking into other people's Spotify accounts.</li>
        <li>We reserve the right to restrict your access to the Service at any time for any reason.</li>
        <li>To use the Service, paid subscription to Spotify Service (“Spotify Premium”) is required. While using SpotiShuffle, you must also comply with the Spotify Terms of Use.</li>
        <li>SpotiShuffle or Creator is not affiliated with Spotify in any way.</li>
        <li>SpotiShuffle is a Single Page Application that runs entirely in your browser. This means that We do not collect any of your personal information, and any data you provide (including, but not limited to: Spotify access token, selected playlists, generated playback queue) is not stored and immediately removed after closing or refreshing the App. The only exception is when you decide to save current playback queue, which creates and saves playlist in your Spotify account.</li>
        <li>Although we do not collect any of your personal information, Spotify may collect some data, as stated in Spotify Privacy Policy.</li>
        <li>These terms of service may be updated from time to time without notice. It is your responsibility to check these terms of service periodically for changes. By using SpotiShuffle after any such changes have been made, you agree to be bound by the revised terms of service.</li>
      </ol>
      <p class="disclaimer">THE SERVICE IS PROVIDED TO YOU "AS IS" AND "AS AVAILABLE" AND WITH ALL FAULTS AND DEFECTS WITHOUT WARRANTY OF ANY KIND. TO THE MAXIMUM EXTENT PERMITTED UNDER APPLICABLE LAW, WE, ON OUR OWN BEHALF AND ON BEHALF OF ITS AFFILIATES AND ITS AND THEIR RESPECTIVE LICENSORS AND SERVICE PROVIDERS, EXPRESSLY DISCLAIMS ALL WARRANTIES, WHETHER EXPRESS, IMPLIED, STATUTORY OR OTHERWISE, WITH RESPECT TO THE SERVICE, INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE AND NON-INFRINGEMENT, AND WARRANTIES THAT MAY ARISE OUT OF COURSE OF DEALING, COURSE OF PERFORMANCE, USAGE OR TRADE PRACTICE. WITHOUT LIMITATION TO THE FOREGOING, WE PROVIDE NO WARRANTY OR UNDERTAKING, AND MAKES NO REPRESENTATION OF ANY KIND THAT THE SERVICE WILL MEET YOUR REQUIREMENTS, ACHIEVE ANY INTENDED RESULTS, BE COMPATIBLE OR WORK WITH ANY OTHER SOFTWARE, APPLICATIONS, SYSTEMS OR SERVICES, OPERATE WITHOUT INTERRUPTION, MEET ANY PERFORMANCE OR RELIABILITY STANDARDS OR BE ERROR FREE OR THAT ANY ERRORS OR DEFECTS CAN OR WILL BE CORRECTED.</p>
      <p class="disclaimer">WITHOUT LIMITING THE FOREGOING, NEITHER US NOR ANY OF OUR PROVIDER MAKES ANY REPRESENTATION OR WARRANTY OF ANY KIND, EXPRESS OR IMPLIED: (I) AS TO THE OPERATION OR AVAILABILITY OF THE SERVICE, OR THE INFORMATION, CONTENT, AND MATERIALS OR PRODUCTS INCLUDED THEREON; (II) THAT THE SERVICE WILL BE UNINTERRUPTED OR ERROR-FREE; (III) AS TO THE ACCURACY, RELIABILITY, OR CURRENCY OF ANY INFORMATION OR CONTENT PROVIDED THROUGH THE SERVICE; OR (IV) THAT THE SERVICE, ITS SERVERS, THE CONTENT, OR E-MAILS SENT FROM OR ON BEHALF OF US ARE FREE OF VIRUSES, SCRIPTS, TROJAN HORSES, WORMS, MALWARE, TIMEBOMBS OR OTHER HARMFUL COMPONENTS.</p>
      <p class="disclaimer">SOME JURISDICTIONS DO NOT ALLOW THE EXCLUSION OF CERTAIN TYPES OF WARRANTIES OR LIMITATIONS ON APPLICABLE STATUTORY RIGHTS OF A CONSUMER, SO SOME OR ALL OF THE ABOVE EXCLUSIONS AND LIMITATIONS MAY NOT APPLY TO YOU. BUT IN SUCH A CASE THE EXCLUSIONS AND LIMITATIONS SET FORTH IN THIS SECTION SHALL BE APPLIED TO THE GREATEST EXTENT ENFORCEABLE UNDER APPLICABLE LAW.</p>
    </div>
  </n-space>
</template>

<style lang="scss">
.disclaimer {
  font-weight: bold;
}

#terms {
  width: 90vw;
  max-width: 1000px;
  margin: 50px 0;
  text-align: justify;
}
</style>