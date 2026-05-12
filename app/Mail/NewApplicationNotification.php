<?php
namespace App\Mail;

use App\Models\Application;
use App\Models\Candidate;
use App\Models\JobOffer;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class NewApplicationNotification extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Candidate $candidate,
        public JobOffer $jobOffer,
        public Application $application
    ) {}

    public function build(): static
    {
        $pipelineUrl = env('FRONTEND_URL', 'http://localhost:5173')
            . '/job-offers/' . $this->jobOffer->id . '/pipeline';

        $firstName = htmlspecialchars($this->candidate->first_name, ENT_QUOTES, 'UTF-8');
        $lastName  = htmlspecialchars($this->candidate->last_name,  ENT_QUOTES, 'UTF-8');
        $email     = htmlspecialchars($this->candidate->email,      ENT_QUOTES, 'UTF-8');
        $jobTitle  = htmlspecialchars($this->jobOffer->title,       ENT_QUOTES, 'UTF-8');
        $safeUrl   = htmlspecialchars($pipelineUrl,                 ENT_QUOTES, 'UTF-8');

        $subject = "New Application: {$firstName} {$lastName} → {$jobTitle}";

        return $this
            ->subject($subject)
            ->html(
                '<div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px;color:#0a0a0a;">'
                . '<h2 style="margin:0 0 16px;">New Application Received</h2>'
                . "<p style=\"margin:0 0 8px;\"><strong>{$firstName} {$lastName}</strong>"
                . " ({$email}) has applied to <strong>{$jobTitle}</strong>.</p>"
                . "<a href=\"{$safeUrl}\" style=\"display:inline-block;margin-top:20px;padding:12px 24px;"
                . "background:#0a0a0a;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;\">View in Pipeline</a>"
                . '</div>'
            );
    }
}
