<script lang="ts">
	import moment from 'moment';
	import { ReservationStatusEnum } from '../../../../models/reservationEnum';

	export let reservationData: any;
	export let contactInfo: any;
	export let status: any;
</script>

{#if status === ReservationStatusEnum.ACCEPT}
	<p>
		Dear <span style="color:#e1b168; font-weight:bold">
			{reservationData.company.company_name ?? 'User'}
		</span>
		,
	</p>

	<p>
		We are thrilled to inform you that your reservation request for seat(s) for the on {moment(
			reservationData.created_at
		).format('DD-MM-YYYY  HH:SS:MM')} has been
		<strong style="color:#e1b168; font-weight:bold">accepted and confirmed!</strong>
	</p>

	<p>Here are the details of your confirmed reservation:</p>
	<ul>
		<li>Event: {reservationData.exhibition?.exhibition_type}</li>
		<li>
			Reservation Date and Time: {moment(reservationData.created_at).format('DD-MM-YYYY  HH:SS:MM')}
		</li>
		<li>Special Requests or Notes: {reservationData.comment}</li>
	</ul>

	<p>
		We can't wait to welcome you to {reservationData.company.company_name}. Your reservation is now
		guaranteed, and we are prepared to provide you with an exceptional experience.
	</p>

	<p>
		If you have any additional questions or require further assistance, please do not hesitate to
		contact us at <span style="color:#e1b168; font-weight:bold">
			{contactInfo.email}
		</span>
		,
		<span style="color:#e1b168; font-weight:bold">
			{contactInfo.phoneNumber_marketing}
		</span>. Our team is here to ensure your visit is enjoyable and stress-free.
	</p>

	<p>
		Thank you for choosing SulyExpo. We look forward to hosting you and making your experience a
		memorable one. Please arrive on time to enjoy the event to the fullest.
	</p>

	<p>Warm regards,</p>
	<p>Suly Expo</p>
	<div>
		<li>
			<span style="color:#e1b168; font-weight:bold"> Marketing: </span>
			{contactInfo.phoneNumber_marketing}
		</li>
		<li>
			<span style="color:#e1b168; font-weight:bold">Relations: </span>
			{contactInfo.phoneNumber_relations}
		</li>
		<li>
			<span style="color:#e1b168; font-weight:bold">Technical </span>
			{contactInfo.phoneNumber_Technical}
		</li>
		<li>
			<span style="color:#e1b168; font-weight:bold">Administration</span>
			{contactInfo.phoneNumber_Administration}
		</li>
	</div>
	<p>
		Website:
		<a href={import.meta.env.VITE_BASE_URL}>{import.meta.env.VITE_BASE_URL}</a>
	</p>
{:else}
	<p>Dear {reservationData.company.company_name ?? 'User'},</p>

	<p>
		We regret to inform you that your reservation request for seat on {moment(
			reservationData.created_at
		).format('DD-MM-YYYY  HH:SS:MM')} has been <strong>unfortunately rejected</strong>.
	</p>

	<p>
		We apologize for any inconvenience this may have caused. Please understand that this decision
		was not made lightly, and we sincerely appreciate your interest .
	</p>

	<p>
		If you have any questions or require further clarification regarding this rejection, please do
		not hesitate to reach out to us at

		<span style="color:#e1b168; font-weight:bold">
			{contactInfo.email}
		</span>
		,
		<span style="color:#e1b168; font-weight:bold">
			{contactInfo.phoneNumber_marketing}
		</span>

		. Our team is here to assist you and provide any necessary information.
	</p>

	<p>
		Thank you for considering us, and we hope to have the opportunity to serve you in the future. We
		value your interest in our Exhibition and appreciate your understanding.
	</p>

	<p>Warm regards,</p>
	<p>Suly Expo</p>
	<div>
		<li>
			<span style="color:#e1b168; font-weight:bold"> Marketing: </span>
			{contactInfo.phoneNumber_marketing}
		</li>
		<li>
			<span style="color:#e1b168; font-weight:bold">Relations: </span>
			{contactInfo.phoneNumber_relations}
		</li>
		<li>
			<span style="color:#e1b168; font-weight:bold">Technical </span>
			{contactInfo.phoneNumber_Technical}
		</li>
		<li>
			<span style="color:#e1b168; font-weight:bold">Administration</span>
			{contactInfo.phoneNumber_Administration}
		</li>
	</div>
	<p>
		Website:
		<a href={import.meta.env.VITE_BASE_URL}>{import.meta.env.VITE_BASE_URL}</a>
	</p>
{/if}
